import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createStore from "./store-core";

import type { SetState, Store } from "./store-core";

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
  S extends Record<string, any> = Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(options: {
  state: S;
  actions?:
    | ((this: A, set: SetState<S>) => A)
    | Array<(this: Partial<A>, set: SetState<S>) => Partial<A>>;
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
