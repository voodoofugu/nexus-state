import React, {
  useRef,
  useContext,
  useCallback,
  createContext,
  useSyncExternalStore,
} from "react";
import Storage from "./Storage";

export default function nexusContext() {
  let actionsLocal = {};

  function reducer(state, action) {
    const type = action.type;
    const payload = action.payload;

    if (actionsLocal[type]) {
      const config = actionsLocal[type];

      if (config.reducer) {
        return {
          ...state,
          ...config.reducer(state, action),
        };
      } else {
        return {
          ...state,
          ...payload,
        };
      }
    } else {
      console.warn(`Action type "${type}" not found 👺`);
      return state;
    }
  }

  function useStatesContextData(initialStates, passedReducer) {
    const store = useRef(initialStates);

    const get = useCallback(() => store.current, [store]);

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
      reducer: (state, action) => passedReducer(state, action),
    };
  }

  const StatesContext = createContext(null);

  function NexusProvider({ children, initialStates, actions, watch }) {
    actionsLocal = actions;

    return (
      <StatesContext.Provider
        value={useStatesContextData(initialStates, reducer)}
      >
        {typeof window !== "undefined" && (
          <Storage useNexusAll={useNexusAll} watch={watch} />
        )}
        {children}
      </StatesContext.Provider>
    );
  }

  function useStatesContext(selector) {
    const statesContext = useContext(StatesContext);
    if (!statesContext) {
      console.error(`NexusProvider not found 👺`);
    }

    const state = useSyncExternalStore(
      statesContext.subscribe,
      () => selector(statesContext.get()),
      () => selector(statesContext.initialStates)
    );

    const set = (value) => {
      if ("type" in value) {
        const newState = statesContext.reducer(statesContext.get(), value);
        statesContext.set(newState);
      } else {
        statesContext.set(value);
      }
    };

    return [state, set];
  }

  function useNexus(stateName) {
    const [getter, setter] = useStatesContext((state) => {
      if (
        typeof state !== "object" ||
        state === null ||
        !(stateName in state)
      ) {
        console.warn(`initialState "${stateName}" not found 👺`);
        return undefined;
      }
      return state[stateName];
    });
    return [getter, setter];
  }

  function useNexusAll() {
    const [statesContext] = useStatesContext((state) => state);
    return statesContext;
  }

  return {
    useNexus,
    useNexusAll,
    NexusProvider,
  };
}
