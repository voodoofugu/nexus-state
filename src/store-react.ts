import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createStore from "./store-core";

import funcToMiniStr from "./helpers/funcToMiniStr";

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
    const updater = useUpdate();
    const lastSelected = useRef<R>(selector(store.getNexus()));
    const selectorRef = useRef(selector);
    const selectorStringRef = useRef("");
    const depsRef = useRef<string[] | null>(null);

    // проверяем selector
    const nextSelectorString = funcToMiniStr(selector);
    if (!selectorStringRef.current)
      selectorStringRef.current = nextSelectorString;

    const isSelectorChanged =
      selectorRef.current !== selector ||
      selectorStringRef.current !== nextSelectorString;

    if (isSelectorChanged) {
      selectorRef.current = selector;
      selectorStringRef.current = nextSelectorString;
    }

    // проверяем dependencies
    if (
      !depsRef.current ||
      depsRef.current.length !== dependencies.length ||
      depsRef.current.some((d, i) => d !== dependencies[i])
    ) {
      depsRef.current = dependencies as string[];
    }

    const depsChanged =
      depsRef.current?.length !== dependencies.length ||
      depsRef.current.some((d, i) => d !== dependencies[i]);

    // логика
    useEffect(() => {
      if (!isSelectorChanged && !depsChanged) return;

      const callback = () => {
        const newSelected = selectorRef.current(store.getNexus());
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          updater();
        }
      };

      const unsubscribe = store.nexusSubscribe(depsRef.current!, callback);
      callback();

      return unsubscribe;
    }, [isSelectorChanged, depsRef.current]);

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
