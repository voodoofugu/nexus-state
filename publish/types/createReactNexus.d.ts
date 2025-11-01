import type { RecordAny, CreateActsUnion } from "./core";
import type { ReactNexus } from "./reactNexus";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createReactNexus***:
 * creates an extended nexus store with React bindings and hooks.
 * @param options store configuration including entire initial `state` and optional `acts`.
 * @returns instance with core methods and React Hooks.
 * @example
 * const nexus = createReactNexus({
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
declare function createReactNexus<
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
   */
  acts?: CreateActsUnion<A, S>;
}): ReactNexus<S, A>;
