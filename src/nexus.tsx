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
      return action.payload.reduce((state, actionData: ActionsCallingT) => {
        // Здесь мы должны проверять каждый отдельный action в массиве
        const { stateKey, payload } = actionData;

        // Если есть stateKey, обновляем его в текущем состоянии
        if (stateKey) {
          const currentValue = state[stateKey];

          // Если payload — функция, вызываем её для обновления значения
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

        // Если stateKey нет, ищем редьюсер для конкретного действия
        const singleActionType = actionData.type as keyof ActionsRT;
        if (singleActionType in actions) {
          const actionConfig = actions[singleActionType] as {
            reducer?: (state: StatesT, action: ActionsCallingT) => StatesT;
          };

          // Выполняем редьюсинг для каждого отдельного действия
          const newState = actionConfig.reducer?.(state, actionData) ?? state;

          // Возвращаем новое состояние, если оно изменилось
          return newState !== state ? newState : state;
        }

        return state;
      }, state);
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
  actions: ActionsRT;
  children: React.ReactNode;
}> = ({ initialStates, actions, children }) => {
  const reducer = createReducer(actions);
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
type UpdatePayload<T> = T | ((prevState: T) => T);

type NexusUpdate<K extends keyof StatesT | "*" = keyof StatesT> = {
  [key in K]: key extends "*" ? StatesT : UpdatePayload<StatesT>;
};

function nexusUpdate<K extends keyof StatesT | "*">(updates: NexusUpdate<K>) {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusDispatch is not initialized. Make sure NexusProvider is used 👺"
    );
  }

  // Проверка, если обновление всех состояний
  const isFullUpdate = "*" in updates;

  if (isFullUpdate) {
    // Специальный случай для обновления всех стейтов
    const newState = updates["*"] as StatesT; // Все состояние
    nexusDispatchRef({
      payload: Object.keys(newState).map((key) => ({
        stateKey: key as keyof StatesT,
        payload: newState[key as keyof StatesT],
      })),
    });
  } else {
    const actionsArray = Object.entries(updates).map(
      ([stateKey, updateValue]) => {
        return {
          stateKey: stateKey as K,
          payload: updateValue,
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
