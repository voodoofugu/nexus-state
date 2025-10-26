import type { RecordAny, ActionCreateUnion } from "./core";
import type { ReactStore } from "./reactStore";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createReactStore`*:
 * creates an extended store with React bindings and hooks.
 * @param options Store configuration including entire initial `state` and optional `actions`.
 * @returns `store` instance with core methods plus React Hooks and `actionStore`.
 * @example
 * const { store, actionStore } = createReactStore({
 *   state: {
 *     key: "initialValue"
 *   },
 *
 *   actions: (getNexus, setNexus) => ({
 *     actionName() { setNexus({ key: "newValue" }); }
 *     actionGetKey() { console.log("Key value:", getNexus("key")); }
 *   })
 * })
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createReactStore<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; actions?: ActionCreateUnion<A, S> }): ReactStore<S, A>;
