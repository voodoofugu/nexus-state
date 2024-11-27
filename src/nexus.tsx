import React from "react";
import { ActionsCallingT, ActionsRT, NexusContextT } from "./types";

function createReducer(actions: ActionsRT) {
  return function reducerNexus(
    state: StatesT,
    action: ActionsCallingT
  ): StatesT {
    // Обработка массива nexusDispatch и батчинга
    if (Array.isArray(action.payload)) {
      return action.payload.reduce(
        (currentState, singleAction: ActionsCallingT) => {
          const singleActionType = singleAction.type as keyof ActionsRT;

          if (singleActionType in actions) {
            const actionConfig = actions[singleActionType] as {
              reducer?: (state: StatesT, action: ActionsCallingT) => StatesT;
            };
            return (
              actionConfig.reducer?.(currentState, singleAction) ?? currentState
            );
          }

          return currentState;
        },
        state
      );
    }

    return state;
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

// Функция проверки существования контекста
function contextExist(): NexusContextT {
  const ctx = React.useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found 👺");
  }
  return ctx;
}

// Хуки
function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];
function useNexus(): StatesT;
function useNexus(stateName?: keyof StatesT) {
  const ctx = contextExist();
  return stateName ? ctx.get(stateName) : ctx.getAll();
}

const useNexusSelect = <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
): StatesT[K] => {
  const ctx = contextExist();

  return selector(ctx.getAll());
};

// functions
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

function nexusAction(
  reducer?: (state: StatesT, action: ActionsCallingT) => StatesT
) {
  return {
    reducer: reducer || ((state: StatesT) => state),
  };
}

export { NexusProvider, useNexus, useNexusSelect, nexusDispatch, nexusAction };
