import React from "react";
import {
  UpdateFunction,
  ActionsCallingT,
  ActionsRT,
  NexusContextT,
} from "./types";

function createReducer(actions: ActionsRT) {
  return function reducerNexus(
    state: StatesT,
    action: ActionsCallingT
  ): StatesT {
    // Если payload — массив (батчинг действий)
    if (Array.isArray(action.payload)) {
      return action.payload.reduce(
        (currentState, actionData: ActionsCallingT) => {
          return reducerNexus(currentState, actionData); // Рекурсивная обработка каждого действия
        },
        state
      );
    }

    // Если одиночное действие
    const { stateKey, payload, type } = action;

    // Обновляем stateKey, если он указан
    if (stateKey) {
      const currentValue = state[stateKey];

      // Если payload — функция, вызываем её
      const newValue =
        typeof payload === "function"
          ? (payload as UpdateFunction<typeof currentValue>)(currentValue)
          : payload;

      if (newValue !== currentValue) {
        return {
          ...state,
          [stateKey]: newValue,
        };
      }
    }

    // Обрабатываем действие через actions
    if (type) {
      const actionConfig = actions[type];

      // Если у действия есть редьюсер
      if (actionConfig?.reducer) {
        return actionConfig.reducer(state, payload) ?? state;
      }

      // Если у действия есть функция action
      if (actionConfig?.action) {
        actionConfig.action(payload); // Выполняем побочный эффект
        return state; // Возвращаем текущее состояние без изменений
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

  const get = React.useCallback(() => store, []);
  const set = React.useCallback((value: Partial<StatesT>) => {
    store = { ...store, ...value };
    subscribers.current.forEach((callback) => callback());
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
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT
) {
  const stateData = getContextMethods(initialStates);

  function get<K extends keyof StatesT>(stateName: K): StatesT[K] {
    if (!(stateName in stateData.get())) {
      console.error(`State "${String(stateName)}" in useNexus not found 👺`);
    }

    return React.useSyncExternalStore(
      stateData.subscribe,
      () => stateData.get()[stateName] ?? initialStates[stateName],
      () => initialStates[stateName]
    );
  }

  function selector<K extends keyof StatesT>(
    select: (state: StatesT) => StatesT[K]
  ): StatesT[K] {
    const state = stateData.get();
    if (select(state) === undefined) {
      console.error("State in useNexusSelect not found 👺");
    }

    return React.useSyncExternalStore(
      stateData.subscribe,
      () => select(stateData.get()),
      () => select(initialStates)
    );
  }

  function dispatch(action: ActionsCallingT): void {
    const currentState = stateData.get();
    const newState = reducer(currentState, action);
    if (currentState !== newState) {
      stateData.set(newState);
    }
  }

  function getAll(): StatesT {
    return React.useSyncExternalStore(
      stateData.subscribe,
      stateData.get,
      () => initialStates
    );
  }

  return {
    get,
    dispatch,
    getAll,
    selector,
    subscribe: stateData.subscribe,
  };
}

// Создание контекста
const NexusContext = React.createContext<NexusContextT | null>(null);

let nexusDispatchRef: ((action: ActionsCallingT) => void) | null = null;
const NexusProvider: React.FC<{
  initialStates: StatesT;
  actions?: ActionsRT;
  children: React.ReactNode;
}> = ({ initialStates, actions, children }) => {
  const reducer = createReducer(actions || {});
  const immutableInitialStates = structuredClone(initialStates);

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

  return selector(ctx.getAll());
};

// FUNCTIONS
// nexusDispatch
function nexusDispatch(
  action:
    | {
        type: keyof ActionsT;
        payload?: any;
      }
    | {
        type: keyof ActionsT;
        payload?: any;
      }[]
): void {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusDispatch is not initialized. Make sure NexusProvider is used 👺"
    );
  }

  const actions = Array.isArray(action) ? action : [action];

  nexusDispatchRef({
    payload: actions,
  });
}

// nexusUpdate
function nexusUpdate<K extends keyof StatesT>(updates: {
  [key in K]: StatesT[key] | ((prevState: StatesT[key]) => StatesT[key]);
}) {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusDispatch is not initialized. Make sure NexusProvider is used 👺"
    );
  }

  // Проверка, если обновление всех состояний
  const isFullUpdate = "_NEXUS_" in updates;

  if (isFullUpdate) {
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

// nexusAction
function nexusAction<K extends keyof StatesT>(
  stateKey: K
): { reducer: (state: StatesT, action: ActionsCallingT) => StatesT };

function nexusAction(
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT
): { reducer: (state: StatesT, action: ActionsCallingT) => StatesT };

function nexusAction<K extends keyof StatesT>(
  reducerOrStateKey?: K | ((state: StatesT, action: ActionsCallingT) => StatesT)
) {
  if (typeof reducerOrStateKey === "function") {
    // Если передан редьюсер, возвращаем его
    return {
      reducer: (state: StatesT, action: ActionsCallingT): StatesT => {
        return reducerOrStateKey(state, action);
      },
    };
  } else if (typeof reducerOrStateKey === "string") {
    // Если передан ключ состояния, создаём редьюсер для этого ключа

    const key = reducerOrStateKey as K;
    return {
      reducer: (state: StatesT, action: ActionsCallingT): StatesT => {
        if (!(reducerOrStateKey in state)) {
          console.error(
            `State key "${reducerOrStateKey}" does not exist in StatesT 👺`
          );
          return state;
        }
        // Обновляем только указанное состояние
        return {
          ...state,
          [key]: action.payload,
        };
      },
    };
  }

  throw new Error("Reducer or state key must be provided in Nexus 👺");
}

export {
  NexusProvider,
  useNexus,
  useNexusSelect,
  nexusDispatch,
  nexusUpdate,
  nexusAction,
};
