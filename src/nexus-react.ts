import { useSyncExternalStore, useCallback, useReducer, useRef } from "react";
import createNexus from "./nexus-core";
import { sameValue, shallow } from "./shallow";
import { track } from "./track";

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
    isEqual?: "shallow" | EqualityFn<R>
  ): R {
    // Read the latest selector / comparator through refs so the caller never has
    // to wrap them in `useCallback` to keep the subscription stable. `"shallow"`
    // resolves to the built-in one-level comparator.
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const isEqualRef = useRef<EqualityFn<R>>(sameValue);
    isEqualRef.current =
      isEqual === "shallow"
        ? (shallow as EqualityFn<R>)
        : isEqual ?? sameValue;

    // Cache the derived value so `getSnapshot` stays referentially stable when
    // the result is unchanged, and remember which keys the selector last read.
    const cache = useRef<{ value: R } | null>(null);
    const keysRef = useRef<Dependencies<S>>(["*"]);

    const getSnapshot = (): R => {
      const { value, keys } = track(nexus.get(), selectorRef.current);
      keysRef.current = keys;
      const prev = cache.current;
      if (prev !== null && isEqualRef.current(prev.value, value)) {
        return prev.value;
      }
      cache.current = { value };
      return value;
    };

    // Evaluate eagerly so `keysRef` reflects the keys actually read *before*
    // `subscribe` is memoized — the first render then subscribes to the real
    // keys. When a conditional selector reads a different set, `keysKey` changes
    // and useSyncExternalStore re-subscribes to the new set.
    getSnapshot();
    // Order-independent so reading the same keys in a different order doesn't
    // force a re-subscription.
    const keysKey = (keysRef.current as string[]).slice().sort().join(",");

    const subscribe = useCallback(
      (callback: () => void) => nexus.subscribe(callback, keysRef.current),
      [keysKey]
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
