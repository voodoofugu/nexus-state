import React from "react";

type Action = {
  type: string;
  payload?: any;
};

export default function context<Context>(
  initialStates: Context,
  reducer: (state: Context, action: Action) => Context
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
  // Перегрузка для возвращаемого типа в зависимости от входного параметра
  function useGetNexus(stateName: string): any;
  function useGetNexus<SelectorOutput>(
    stateName: string
  ): SelectorOutput | undefined;

  function useGetNexus<SelectorOutput>(
    stateName: string
  ): SelectorOutput | undefined {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusContextProvider not found 👺`);
      return undefined;
    }

    const getState = React.useCallback(() => {
      const state = statesContext.get();
      if (
        typeof state !== "object" ||
        state === null ||
        !(stateName in state)
      ) {
        console.error(`State "${stateName}" not found 👺`);
        return undefined;
      }
      return (state as Record<string, SelectorOutput>)[stateName];
    }, [stateName, statesContext]);

    // Подписка на изменения состояния по ключу
    return React.useSyncExternalStore(
      statesContext.subscribe,
      getState,
      () => getState() // Возвращаем текущее значение при инициализации
    );
  }

  // Хук для обновления состояния по ключу или dispatch action
  function useSetNexus(): (value: Partial<Context> | Action) => void {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusContextProvider not found 👺`);
      return () => {}; // Ничего не делаем, если контекст не найден
    }

    return (value: Partial<Context> | Action) => {
      if ("type" in value) {
        const newState = reducer(statesContext.get(), value as Action);
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
