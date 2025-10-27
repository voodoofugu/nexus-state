import { useSyncExternalStore, useEffect, useRef, useReducer } from "react";
import createNexus from "./nexus-core";

import type { ActsCreateUnion, RecordAny, ReactNexus } from "./types/core";

function createReactNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; acts?: ActsCreateUnion<A, S> }): ReactNexus<S, A> {
  // для принудительного обновления
  const useRerender = () => {
    const [, forceUpdate] = useReducer(() => ({}), {});
    return forceUpdate;
  };

  const nexus = createNexus<S, A>(options);

  function use(): S;
  function use<K extends keyof S>(key: K): S[K];
  function use<K extends keyof S>(key?: K): S | S[K] {
    return useSyncExternalStore(
      (callback) => nexus.subscribe(callback, key ? [key] : ["*"]), // если нет key подписываемся на "*"
      () => {
        return key ? nexus.get(key) : nexus.get();
      }
    );
  }

  function useSelector<R>(
    observer: (state: S) => R,
    dependencies: (keyof S)[]
  ) {
    const updater = useRerender();
    const lastSelected = useRef<R>(observer(nexus.get()));

    useEffect(() => {
      const callback = (state: S) => {
        const newSelected = observer(state);
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          updater();
        }
      };

      const unsubscribe = nexus.subscribe(callback, dependencies);

      callback(nexus.get());

      return unsubscribe;
    }, [observer, dependencies.join()]);

    return lastSelected.current;
  }

  return {
    ...nexus,
    use,
    useRerender,
    useSelector,
  };
}

export default createReactNexus;
