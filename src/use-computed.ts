import { useSyncExternalStore } from "react";
import type { Computed } from "./types/core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***useComputed***:
 * subscribes a React component to a `computed` value.
 * @description
 * Re-renders only when the computed's cached value changes. Built on
 * `useSyncExternalStore`, so it is concurrent-safe.
 * @param computed a value from `computed(nexus, selector)`.
 * @returns the current computed value.
 * @example
 * ```tsx
 * import { computed } from "nexus-state/computed";
 * import { useComputed } from "nexus-state/react";
 *
 * const total = computed(nexus, (s) => s.a + s.b);
 *
 * function Total() {
 *   return <span>{useComputed(total)}</span>;
 * }
 * ```
 */
function useComputed<R>(computed: Computed<R>): R {
  return useSyncExternalStore(
    computed.subscribe,
    computed.get,
    computed.get
  );
}

export { useComputed };
