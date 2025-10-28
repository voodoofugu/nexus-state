import type { RecordAny, CreateActsUnion } from "./core";
import type { Nexus } from "./nexusCore";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createNexus***:
 * creates a new framework-agnostic nexus store instance.
 * @param options store configuration including entire initial `state` and optional `acts`.
 * @returns "{@link Nexus}" instance with core methods.
 * @example
 * const nexus = createNexus({
 *   state: {
 *     key: "initialValue"
 *   },
 *
 *   acts: (get, set) => ({
 *     actionName() { set({ key: "newValue" }); }
 *     actionGetKey() { console.log("Key value:", get("key")); }
 *   })
 * })
 * @template S Type of initial state
 * @template A Optional type of acts
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
export declare function createNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***state***:
   * initial state object.
   * @example
   * state: {
   *   key: "initialValue"
   * }
   * @template S Type of initial state
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  state: S;
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***acts***:
   * optional acts object.
   * @example
   * acts: (get, set) => ({
   *   actionName() { set({ key: "newValue" }); }
   *   actionGetKey() { console.log("Key value:", get("key")); }
   * })
   * @template A Type of acts
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  acts?: CreateActsUnion<A, S>;
}): Nexus<S, A>;
