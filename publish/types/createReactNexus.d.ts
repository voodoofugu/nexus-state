import type { RecordAny, ActsCreateUnion } from "./core";
import type { ReactNexus } from "./reactNexus";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createReactNexus`*:
 * creates an extended store with React bindings and hooks.
 * @param options nexus configuration including entire initial `state` and optional `acts`.
 * @returns `store` instance with core methods plus React Hooks and `actionStore`.
 * @example
 * const { store, actionStore } = createReactNexus({
 *   state: {
 *     key: "initialValue"
 *   },
 *
 *   acts: (get, set) => ({
 *     actionName() { set({ key: "newValue" }); }
 *     actionGetKey() { console.log("Key value:", get("key")); }
 *   })
 * })
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createReactNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; acts?: ActsCreateUnion<A, S> }): ReactNexus<S, A>;
