import { sameValue, shallow } from "./shallow";
import { track } from "./track";
import type {
  Nexus,
  RecordAny,
  EqualityFn,
  Dependencies,
  Computed,
} from "./types/core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***computed***:
 * a cached, subscribable value derived from a nexus.
 * @description
 * Unlike `useSelector` (which derives per-component, React-only), a `computed` is
 * defined **once** and shared: it recomputes a single time when its inputs change
 * and every consumer reads the same cached value. Framework-agnostic — usable in
 * actions, middleware, other computeds, or React (via `useComputed`).
 *
 * The keys the `selector` reads are tracked automatically (shallow proxy), so it
 * only recomputes when a key it actually uses changes. It notifies subscribers
 * only when the **result** changes — `Object.is` by default, `"shallow"` or a
 * custom comparator otherwise. Read state through the `selector` argument, not
 * `nexus.get()`, or the read won't be tracked.
 * @param nexus source nexus (from `createNexus` or `createReactNexus`).
 * @param selector derives a value from the full state.
 * @param isEqual optional result comparator: `"shallow"` or `(a, b) => boolean`.
 * @returns a `Computed` with `get`, `subscribe` and `dispose`.
 * @example
 * ```ts
 * import { computed } from "nexus-state/computed";
 *
 * const total = computed(nexus, (s) => s.cart.reduce((n, i) => n + i.price, 0));
 * total.get(); // current total
 * const off = total.subscribe((v) => console.log("total:", v));
 * ```
 */
function computed<S extends RecordAny, R>(
  nexus: Nexus<S, RecordAny>,
  selector: (state: S) => R,
  isEqual?: "shallow" | EqualityFn<R>
): Computed<R> {
  const equal: EqualityFn<R> =
    isEqual === "shallow" ? (shallow as EqualityFn<R>) : isEqual ?? sameValue;

  const listeners = new Set<(value: R) => void>();
  let value: R;
  let keysSig = "";
  let unsubscribe: (() => void) | null = null;

  // Order-independent signature so reading the same keys in a different order
  // doesn't trigger a spurious re-subscription.
  const sig = (keys: Dependencies<S>) => (keys as string[]).slice().sort().join(",");

  const listen = (keys: Dependencies<S>) => {
    if (unsubscribe) unsubscribe();
    keysSig = sig(keys);
    // Empty keys (a constant selector) -> subscribe returns a no-op, so the
    // computed simply never recomputes. That's correct.
    unsubscribe = nexus.subscribe(onChange, keys);
  };

  const onChange = () => {
    const next = track(nexus.get(), selector);
    if (sig(next.keys) !== keysSig) listen(next.keys); // conditional re-track
    if (!equal(value, next.value)) {
      value = next.value;
      listeners.forEach((cb) => cb(value));
    }
  };

  const initial = track(nexus.get(), selector);
  value = initial.value;
  listen(initial.keys);

  return {
    get: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      listeners.clear();
    },
  };
}

export type { Computed };
export { computed };
export default computed;
