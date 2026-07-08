import { useSyncExternalStore, useCallback, useReducer, useRef } from "react";
import createNexus from "./nexus-core";
import { sameValue } from "./shallow";

import type {
  RecordAny,
  ReactNexus,
  NexusOptions,
  Dependencies,
  EqualityFn,
  ActsCreate,
  ActsPart,
} from "./types/core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createReactNexus***:
 * creates a nexus store with React hooks.
 * @description
 * `createReactNexus` returns the full framework-agnostic nexus API plus
 * `use`, `useSelector` and `useRerender`. React is an optional peer dependency
 * and is only needed when importing `nexus-state/react`.
 * @param options initial state and optional action creator, action slice or action slices.
 * @returns a `ReactNexus` instance.
 * @example
 * ```tsx
 * import { createReactNexus } from "nexus-state/react";
 *
 * const nexus = createReactNexus({
 *   state: { count: 0 },
 *   acts: (get, set) => ({
 *     increment() {
 *       set({ count: get("count") + 1 });
 *     },
 *   }),
 * });
 *
 * function Counter() {
 *   const count = nexus.use("count");
 *   return <button onClick={nexus.acts.increment}>{count}</button>;
 * }
 * ```
 */
function createReactNexus<S extends RecordAny, A extends RecordAny>(options: {
  state: S;
  acts: ActsCreate<S, A>;
}): ReactNexus<S, A>;
function createReactNexus<S extends RecordAny, A extends RecordAny>(options: {
  state: S;
  acts: ActsPart<S, A> | ActsPart<S, A>[];
}): ReactNexus<S, A>;
function createReactNexus<S extends RecordAny>(options: {
  state: S;
}): ReactNexus<S, Record<string, never>>;
function createReactNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = Record<string, never>
>(options: NexusOptions<S, A>): ReactNexus<S, A>;
function createReactNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = Record<string, never>
>(options: NexusOptions<S, A>): ReactNexus<S, A> {
  const nexus = createNexus<S, A>(options);

  // --- force a component re-render (for refs / non-reactive values) ---
  function useRerender() {
    const [, forceUpdate] = useReducer((c: number) => c + 1, 0);
    return forceUpdate as () => void;
  }

  function use(): S;
  function use<K extends keyof S>(key: K): S[K];
  function use<K extends keyof S>(key?: K): S | S[K] {
    const subscribe = useCallback(
      (callback: () => void) =>
        nexus.subscribe(callback, key !== undefined ? [key] : ["*"]),
      [key]
    );
    const getSnapshot = () =>
      key !== undefined ? nexus.get(key) : nexus.get();

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  function useSelector<R>(
    selector: (state: S) => R,
    dependencies: Dependencies<S> = ["*"],
    isEqual: EqualityFn<R> = sameValue
  ): R {
    // Read the latest selector / comparator through refs so the caller never has
    // to wrap them in `useCallback` to keep the subscription stable.
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const isEqualRef = useRef(isEqual);
    isEqualRef.current = isEqual;

    // Cache the derived value so `getSnapshot` stays referentially stable
    // when the comparator says the selection is unchanged.
    const cache = useRef<{ value: R } | null>(null);

    const getSnapshot = () => {
      const next = selectorRef.current(nexus.get());
      const prev = cache.current;
      if (prev !== null && isEqualRef.current(prev.value, next)) {
        return prev.value;
      }
      cache.current = { value: next };
      return next;
    };

    const depsKey = dependencies.join(",");
    const subscribe = useCallback(
      (callback: () => void) => nexus.subscribe(callback, dependencies),
      [depsKey]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  return {
    ...nexus,
    use,
    useRerender,
    useSelector,
  };
}

export default createReactNexus;
