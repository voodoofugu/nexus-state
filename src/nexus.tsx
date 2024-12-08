import React from "react";
import {
  UpdateFunc,
  FuncsCallT,
  FuncsAT,
  NexusContextT,
  MappedActions,
} from "./types";

function createReducer(initialFuncs: FuncsAT) {
  return function reducerNexus(
    state: StatesT,
    fData: FuncsCallT,
    recursiveCall?: boolean // предотвращаем повторную рекурсию если в payload массив
  ): StatesT {
    // Если payload — массив (батчинг действий)
    if (Array.isArray(fData.payload) && !recursiveCall) {
      return fData.payload.reduce((currentState, funcData: FuncsCallT) => {
        return reducerNexus(currentState, funcData, true); // Рекурсивная обработка каждого действия
      }, state);
    }

    // Если одиночное действие
    const { stateKey, payload, type } = fData;

    // Обновляем stateKey, если он указан
    if (stateKey) {
      const currentValue = state[stateKey];

      // Если payload — функция, вызываем её
      const newValue =
        typeof payload === "function"
          ? (payload as UpdateFunc<typeof currentValue>)(currentValue)
          : payload;

      if (newValue != currentValue) {
        return {
          ...state,
          [stateKey]: newValue,
        };
      }
    }

    // Обрабатываем действие через actions
    if (type) {
      const actionConfig = initialFuncs[type];

      // Если у действия есть fData функция
      if (actionConfig?.fData) {
        actionConfig.fData(payload); // Выполняем побочный эффект
      }
    }

    return state; // Если действие не найдено
  };
}

function getContextMethods(initialStates: StatesT): {
  get: () => StatesT;
  set: (value: Partial<StatesT>) => void;
  subscribe: (callback: () => void) => () => void;
} {
  let store = initialStates;
  const subscribers = React.useRef(new Set<() => void>());
  // добавим таймер на 16мс для оптимизации
  const timerId = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const get = React.useCallback(() => store, []);

  const set = React.useCallback((value: Partial<StatesT>) => {
    store = { ...store, ...value };

    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    timerId.current = setTimeout(() => {
      subscribers.current.forEach((callback) => callback());
      timerId.current = null;
    }, 16);
  }, []);

  const subscribe = React.useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return {
    get,
    set,
    subscribe,
  };
}

// Создание значений контекста
function createContextValue(
  initialStates: StatesT,
  reducer: (state: StatesT, fData: FuncsCallT) => StatesT
) {
  const stateData = getContextMethods(initialStates);

  function get<K extends keyof StatesT>(stateName: K): StatesT[K] {
    if (!(stateName in initialStates)) {
      console.error(`State "${String(stateName)}" in useNexus not found 👺`);
    }

    return React.useSyncExternalStore(
      stateData.subscribe,
      () => stateData.get()[stateName] ?? initialStates[stateName],
      () => initialStates[stateName] // для SSR
    );
  }

  function getAll(): StatesT {
    return React.useSyncExternalStore(
      stateData.subscribe,
      stateData.get,
      () => initialStates // для SSR
    );
  }

  function selector<K extends keyof StatesT>(
    select: (state: StatesT) => StatesT[K]
  ): StatesT[K] {
    return React.useSyncExternalStore(
      stateData.subscribe,
      () => select(stateData.get()),
      () => select(initialStates) // для SSR
    );
  }

  function dispatch(fData: FuncsCallT): void {
    const currentState = stateData.get();
    const newState = reducer(currentState, fData);
    if (currentState !== newState) {
      stateData.set(newState);
    }
  }

  return {
    get,
    getAll,
    selector,
    dispatch,
    subscribe: stateData.subscribe,
  };
}

// Создание контекста
const NexusContext = React.createContext<NexusContextT | null>(null);

let nexusDispatchRef: ((fData: FuncsCallT) => void) | null = null;
const NexusProvider: React.FC<{
  initialStates: StatesT;
  initialFuncs?: FuncsAT;
  children: React.ReactNode;
}> = ({ initialStates, initialFuncs, children }) => {
  const immutableInitialStates = React.useMemo(
    () => JSON.parse(JSON.stringify(initialStates)),
    [initialStates]
  );

  // Создаём reducer
  const reducer = React.useMemo(
    () => createReducer(initialFuncs || {}),
    [initialFuncs]
  );

  const contextValue = {
    ...createContextValue(immutableInitialStates, reducer),
    initialStates, // добавляем initialStates в контекст
  };

  nexusDispatchRef = contextValue.dispatch;

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
};

// HOOKS
// useNexus
function contextExist(): NexusContextT {
  const ctx = React.useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found 👺");
  }
  return ctx;
}

function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];
function useNexus(): StatesT;
function useNexus(stateName?: keyof StatesT) {
  const ctx = contextExist();
  return stateName ? ctx.get(stateName) : ctx.getAll();
}

// useNexusSelect
const useNexusSelect = <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
): StatesT[K] => {
  const ctx = contextExist();

  return ctx.selector(selector);
};

// FUNCTIONS
// nexusTrigger
function nexusTrigger(fData: MappedActions[keyof MappedActions]): void {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusTrigger is not initialized. Make sure NexusProvider is used 👺"
    );
  }

  nexusDispatchRef({
    payload: Array.isArray(fData) ? fData : [fData],
  });
}

// nexusUpdate
function nexusUpdate<K extends keyof StatesT>(updates: {
  [key in K]: StatesT[key] | ((prevState: StatesT[key]) => StatesT[key]);
}) {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusTrigger is not initialized. Make sure NexusProvider is used 👺"
    );
  }

  if ("_NEXUS_" in updates) {
    // Специальный случай для обновления всех стейтов
    const newState = updates["_NEXUS_"] as StatesT;

    nexusDispatchRef({
      payload: Object.keys(newState).map((key) => ({
        stateKey: key as keyof StatesT,
        payload: newState[key as keyof StatesT],
      })),
    });
  } else {
    const actionsArray = Object.entries(updates).map(
      ([stateKey, updateValue]) => {
        const key = stateKey as K;

        return {
          stateKey: key,
          payload:
            // использование (prevState)
            typeof updateValue === "function"
              ? (updateValue as (prevState: StatesT[K]) => StatesT[K])
              : updateValue,
        };
      }
    );

    nexusDispatchRef({
      payload: actionsArray,
    });
  }
}

export { NexusProvider, useNexus, useNexusSelect, nexusTrigger, nexusUpdate };
