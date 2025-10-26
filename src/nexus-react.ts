import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createNexus from "./nexus-core";

import type { ActionCreateUnion, RecordAny, ReactStore } from "./types/core";

function createReactNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; acts?: ActionCreateUnion<A, S> }): ReactStore<S, A> {
  // для принудительного обновления
  const useRerender = () => {
    const [, forceUpdate] = useReducer(() => ({}), {});
    return forceUpdate;
  };

  const store = createNexus<S, A>(options);

  function use(): S;
  function use<K extends keyof S>(key: K): S[K];
  function use<K extends keyof S>(key?: K): S | S[K] {
    return useSyncExternalStore(
      (callback) => store.subscribe(callback, key ? [key] : []),
      () => {
        return key ? store.get(key) : store.get();
      }
    );
  }

  function useSelector<R>(
    observer: (state: S) => R,
    dependencies: (keyof S)[]
  ) {
    const updater = useRerender();
    const lastSelected = useRef<R>(observer(store.get()));

    useEffect(() => {
      const callback = (state: S) => {
        const newSelected = observer(state);
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          updater();
        }
      };

      const unsubscribe = store.subscribe(callback, dependencies);

      callback(store.get());

      return unsubscribe;
    }, [observer, dependencies.join()]);

    return lastSelected.current;
  }

  return {
    ...store,
    use,
    useRerender,
    useSelector,
  };
}

export default createReactNexus;
