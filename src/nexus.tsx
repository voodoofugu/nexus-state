import React from "react";
import { S, A, ActionsType, NexusContextType } from "./types";

let initialStates: S = {} as S;
let actions: ActionsType = {} as ActionsType;

try {
  const userConfig = require("../../nexusConfig");
  if (!userConfig.initialStates || !userConfig.actions) {
    console.warn("nexusConfig must export 'initialStates' and 'actions'.");
  }
  initialStates = userConfig.initialStates;
  actions = userConfig.actions;
} catch (error) {
  if (error instanceof Error) {
    console.warn(`Failed to load nexusConfig: ${error.message}`);
  } else {
    console.warn("Failed to load nexusConfig: Unknown error occurred.");
  }
}

// Менеджер состояния
export default function createReducer(actions: ActionsType) {
  return function reducerNexus(state: S, action: A): S {
    const actionType = action.type;
    const payload = action.payload;

    if (actions[actionType]) {
      const config = actions[actionType];

      if (config.reducer) {
        return config.reducer(state, action);
      } else {
        return {
          ...state,
          ...payload,
        } as S;
      }
    }

    return state;
  };
}

function getContextMethods(initialStates: S): {
  get: () => S;
  set: (value: Partial<S>) => void;
  subscribe: (callback: () => void) => () => void;
} {
  const store = React.useRef(initialStates);
  const subscribers = React.useRef(new Set<() => void>());

  const get = React.useCallback(() => store.current, []);
  const set = React.useCallback((value: Partial<S>) => {
    store.current = { ...store.current, ...value };
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
  initialStates: S,
  reducer: (state: S, action: A) => S
) {
  const stateData = getContextMethods(initialStates);

  function get<K extends keyof S>(stateName: K): S[K] {
    if (!(stateName in stateData.get())) {
      console.error(`State "${String(stateName)}" in useNexus not found 👺`);
    }

    return React.useSyncExternalStore(
      stateData.subscribe,
      () => stateData.get()[stateName] ?? initialStates[stateName],
      () => initialStates[stateName]
    );
  }

  function selector<K extends keyof S>(select: (state: S) => S[K]): S[K] {
    const state = stateData.get();
    if (select(state) === undefined) {
      console.error("State in useSelector not found 👺");
    }

    return React.useSyncExternalStore(
      stateData.subscribe,
      () => select(stateData.get()),
      () => select(initialStates)
    );
  }

  function dispatch(action: A): void {
    const currentState = stateData.get();
    const newState = reducer(currentState, action);
    if (currentState !== newState) {
      stateData.set(newState);
    }
  }

  function getAll(): S {
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
const NexusContext = React.createContext<NexusContextType | null>(null);

let nexusDispatchRef: ((action: A) => void) | null = null;
function NexusProvider({ children }: { children: React.ReactNode }) {
  const reducer = createReducer(actions);
  const contextValue = createContextValue(initialStates, reducer);
  nexusDispatchRef = contextValue.dispatch;

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
}

// Функция проверки существования контекста
function contextExist(): NexusContextType {
  const ctx = React.useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found 👺");
  }
  return ctx;
}

// Хуки
function useNexus<K extends keyof S>(stateName: K): S[K];
function useNexus(): S;
function useNexus(stateName?: keyof S) {
  const ctx = contextExist();
  return stateName ? ctx.get(stateName) : ctx.getAll();
}

const useSelector = <K extends keyof S>(selector: (state: S) => S[K]): S[K] => {
  const ctx = contextExist();

  // Кэшируем функцию селектора
  const memoizedSelector = React.useCallback(selector, [selector]);

  return React.useSyncExternalStore(
    ctx.subscribe,
    () => memoizedSelector(ctx.getAll()),
    () => memoizedSelector(initialStates)
  );
};

// functions
function nexusDispatch(action: A): void {
  if (!nexusDispatchRef) {
    throw new Error(
      "nexusDispatch is not initialized. Make sure NexusProvider is used 👺"
    );
  }
  nexusDispatchRef(action);
}

function createAction(reducer?: (state: S, action: A) => S) {
  return { reducer };
}

export { NexusProvider, useNexus, useSelector, nexusDispatch, createAction };
