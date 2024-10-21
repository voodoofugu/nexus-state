import React from "react";

export type ActionType = {
  type: string;
  payload?: unknown;
};

export default function context<Context extends Record<string, unknown>>(
  initialStates: Context,
  reducer: (state: Context, action: ActionType) => Context
) {
  function useStatesContextData(): {
    get: () => Context;
    set: (value: Partial<Context>) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = React.useRef(initialStates);

    const get = React.useCallback(() => store.current, []);

    const subscribers = React.useRef(new Set<() => void>());

    const set = React.useCallback((value: Partial<Context>) => {
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

  type UseStatesContextDataReturnType = ReturnType<typeof useStatesContextData>;

  const StatesContext =
    React.createContext<UseStatesContextDataReturnType | null>(null);

  function NexusContextProvider({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <StatesContext.Provider value={useStatesContextData()}>
        {children}
      </StatesContext.Provider>
    );
  }

  // Хук для получения состояния по ключу
  function useGetNexus<K extends keyof Context>(stateName: K): Context[K] {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusContextProvider not found 👺`);
      return undefined as Context[K]; // Убедитесь, что возвращаете типизированное значение
    }

    const getState = React.useCallback(() => {
      const state = statesContext.get();
      if (
        typeof state !== "object" ||
        state === null ||
        !(stateName in state)
      ) {
        console.error(`State "${stateName.toString()}" not found 👺`);
        return undefined as Context[K];
      }
      return state[stateName];
    }, [stateName, statesContext]);

    return React.useSyncExternalStore(
      statesContext.subscribe,
      getState,
      getState
    );
  }

  // Хук для обновления состояния по ключу или dispatch action
  function useSetNexus(): (value: Partial<Context> | ActionType) => void {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusContextProvider not found 👺`);
      return () => {}; // Ничего не делаем, если контекст не найден
    }

    return (value: Partial<Context> | ActionType) => {
      if ("type" in value) {
        const newState = reducer(statesContext.get(), value as ActionType);
        statesContext.set(newState);
      } else {
        statesContext.set(value as Partial<Context>);
      }
    };
  }

  // Для получения всего состояния
  function useNexusAll(): Context {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusContextProvider not found 👺`);
      return initialStates; // Возвращаем изначальное состояние, если провайдер не найден
    }

    return React.useSyncExternalStore(
      statesContext.subscribe,
      statesContext.get,
      () => initialStates
    );
  }

  return {
    useGetNexus,
    useSetNexus,
    useNexusAll,
    NexusContextProvider,
  };
}
