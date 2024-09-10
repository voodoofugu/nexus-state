import React from "react";

export default function context(initialStates, reducer) {
  function useStatesContextData() {
    const store = React.useRef(initialStates);

    const get = React.useCallback(() => store.current, []);

    const subscribers = React.useRef(new Set());

    const set = React.useCallback((value) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = React.useCallback((callback) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  const StatesContext = React.createContext(null);

  function ContextStoreProvider({ children }) {
    return (
      <StatesContext.Provider value={useStatesContextData()}>
        {children}
      </StatesContext.Provider>
    );
  }

  function useStatesContext(selector) {
    const statesContext = React.useContext(StatesContext);
    if (!statesContext) {
      throw new Error("Store not found");
    }

    const state = React.useSyncExternalStore(
      statesContext.subscribe,
      () => selector(statesContext.get()),
      () => selector(initialStates)
    );

    const set = (value) => {
      if ("type" in value) {
        const newState = reducer(statesContext.get(), value);
        statesContext.set(newState);
      } else {
        statesContext.set(value);
      }
    };

    return [state, set];
  }

  function useStoreContext(fieldName) {
    const [getter, setter] = useStatesContext((fc) => fc[fieldName]);
    return [getter, setter];
  }

  function useAllStoreContext() {
    const [statesContext] = useStatesContext((fc) => fc);
    return statesContext;
  }

  return {
    ContextStoreProvider,
    useStoreContext,
    useAllStoreContext,
  };
}
