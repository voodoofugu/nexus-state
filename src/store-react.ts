import {
  useSyncExternalStore,
  useEffect,
  useState,
  useRef,
  useReducer,
} from "react";
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
  const [, useUpdate] = useReducer(() => ({}), {});

  const { state: store, actions: actionsInstance } = createStore<T, A>(options);

  const actions = actionsInstance;

  function useNexus(): T;
  function useNexus<K extends keyof T>(key: K): T[K];
  function useNexus<K extends keyof T>(key?: K): T | T[K] {
    return useSyncExternalStore(
      (callback) => store.nexusSubscribe(key ? [key] : "*", callback),
      () => {
        const snapshot = store.getNexus();
        return key ? snapshot[key] : snapshot;
      }
    );
  }

  function useNexusSelector<R>(
    selector: (state: T) => R,
    dependencies: (keyof T)[]
  ) {
    const lastSelected = useRef<R>(selector(store.getNexus()));
    const [selected, setSelected] = useState<R>(lastSelected.current);

    useEffect(() => {
      const callback = () => {
        const newSelected = selector(store.getNexus());
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          setSelected(newSelected);
        }
      };

      const unsubscribe = store.nexusSubscribe(dependencies, callback);
      callback();

      return unsubscribe;
    }, [dependencies, selector]);

    return selected;
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
