import type { RecordAny, ActsCreateUnion } from "./core";
import type { Nexus } from "./nexusCore";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createNexus`*:
 * creates a new framework-agnostic store instance.
 * @param options store configuration including entire initial `state` and optional `acts`.
 * @returns `store` instance with methods and `actionStore`.
 * @example
 * const { store, actionStore } = createNexus({
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
export declare function createNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; acts?: ActsCreateUnion<A, S> }): Nexus<S, A>;
