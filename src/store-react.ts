import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createStore from "./store-core";

type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

interface CreateReactStoreOptions<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: unknown[]) => unknown>
> {
  state: T;
  actions?: ((set: SetState<T>) => A) | Array<(set: SetState<T>) => Partial<A>>;
}

function createReactStore<
  T extends Record<string, any> = Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(options: CreateReactStoreOptions<T, A>) {
  // для принудительного обновления

  const useUpdate = () => {
    const [, forceUpdate] = useReducer(() => ({}), {});
    return forceUpdate;
  };

  const { state: store, actions: actionsInstance } = createStore<T, A>(options);

  const actions = actionsInstance;

  function useNexus(): T;
  function useNexus<K extends keyof T>(key: K): T[K];
  function useNexus<K extends keyof T>(key?: K): T | T[K] {
    return useSyncExternalStore(
      (callback) => store.nexusSubscribe(callback, key ? [key] : []),
      () => {
        const snapshot = store.getNexus();
        return key ? snapshot[key] : snapshot;
      }
    );
  }

  function useNexusSelector<R>(
    observer: (state: T) => R,
    dependencies: (keyof T)[]
  ) {
    const updater = useUpdate();
    const lastSelected = useRef<R>(observer(store.getNexus()));

    useEffect(() => {
      console.log("subscribe");
      const callback = (state: T) => {
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
    state: {
      ...store,
      useNexus,
      useNexusSelector,
      useUpdate,
    },
    actions,
  };
}

export default createReactStore;
