import React, {
  useRef,
  useContext,
  useCallback,
  createContext,
  useSyncExternalStore,
} from "react";

export default function context(initialStates, reducer) {
  function useStatesContextData() {
    const store = useRef(initialStates);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set());

    const set = useCallback((value) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  const StatesContext = createContext(null);

  function NexusContextProvider({ children }) {
    return (
      <StatesContext.Provider value={useStatesContextData()}>
        {children}
      </StatesContext.Provider>
    );
  }

  function useStatesContext(selector) {
    const statesContext = useContext(StatesContext);
    if (!statesContext) {
      throw new Error("Context not found");
    }

    const state = useSyncExternalStore(
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

  function useNexus(fieldName) {
    const [getter, setter] = useStatesContext((fc) => fc[fieldName]);
    return [getter, setter];
  }

  function useNexusAll() {
    const [statesContext] = useStatesContext((fc) => fc);
    return statesContext;
  }

  return {
    useNexus,
    useNexusAll,
    NexusContextProvider,
  };
}
