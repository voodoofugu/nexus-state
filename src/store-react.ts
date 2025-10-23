import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createStore from "./store-core";

import type { Store, ActionCreate, RecordAny } from "./store-core";

type ReactStore<S> = Store<S> & {
  useNexus: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };
  useNexusSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;
  useUpdate: () => React.DispatchWithoutAction;
};

function createReactStore<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: {
  state: S;
  actions?: ActionCreate<A, S>;
}): { store: ReactStore<S>; actions: A } {
  // для принудительного обновления
  const useUpdate = () => {
    const [, forceUpdate] = useReducer(() => ({}), {});
    return forceUpdate;
  };

  const { store, actions: actionsLocal } = createStore<S, A>(options);

  function useNexus(): S;
  function useNexus<K extends keyof S>(key: K): S[K];
  function useNexus<K extends keyof S>(key?: K): S | S[K] {
    return useSyncExternalStore(
      (callback) => store.nexusSubscribe(callback, key ? [key] : []),
      () => {
        return key ? store.getNexus(key) : store.getNexus();
      }
    );
  }

  function useNexusSelector<R>(
    observer: (state: S) => R,
    dependencies: (keyof S)[]
  ) {
    const updater = useUpdate();
    const lastSelected = useRef<R>(observer(store.getNexus()));

    useEffect(() => {
      const callback = (state: S) => {
        const newSelected = observer(state);
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          updater();
        }
      };

      const unsubscribe = store.nexusSubscribe(callback, dependencies);

      callback(store.getNexus());

      return unsubscribe;
    }, [observer, dependencies.join()]);

    return lastSelected.current;
  }

  return {
    store: {
      ...store,
      useNexus,
      useUpdate,
      useNexusSelector,
    },
    actions: actionsLocal,
  };
}

export default createReactStore;
