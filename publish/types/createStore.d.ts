import type { RecordAny, ActionCreateUnion } from "./core";
import type { Store } from "./store";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createStore`*:
 * creates a new framework-agnostic store instance.
 * @param options store configuration including entire initial `state` and optional `actions`.
 * @returns `store` instance with methods and `actionStore`.
 * @example
 * const { store, actionStore } = createStore({
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
export declare function createStore<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; actions?: ActionCreateUnion<A, S> }): Store<S, A>;
