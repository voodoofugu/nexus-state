import type { RecordAny, Setter, Getter, CreateActs } from "./core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createActs***:
 * defines a group of acts.
 * @param create function that receives `get` and `set` with `this` bound to the acts object.
 * @returns actions object.
 * @example
 * const myActions = createActs((get, set) => ({
 *   actionName() {
 *     set({ key: "newValue" }); // direct state update
 *     this.anotherAction(); // ! calling another action
 *   },
 *   anotherAction() {
 *     set((state) => ({ key: state.key + "!" })); // functional state update
 *   }
 * }));
 *
 * // Usage:
 * const nexus = ✦store({ // ✦ createNexus or createReactNexus
 *   state: {...},
 *   acts: myActions, // ! supports multiple: [myActions, myAnotherActions]
 * });
 * @template S Type of initial state
 * @template A Optional type of acts
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createActs<
  S extends RecordAny,
  A extends RecordAny = RecordAny
>(
  create: CreateActs<A, S>
): (
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***get***:
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const myActions = createActs((get) => ({
   *   actionName() {
   *    const specificValue = get("key");
   *    console.log("specificValue:", specificValue);
   *   }
   * }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  get: Getter<S>,
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***set***:
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * const myActions = createActs((_, set) => ({
   *   actionName() {
   *     // Direct state update
   *     set({ key: "newValue" });
   *
   *     // Functional state update
   *     set((state) => ({ key: state.key + "!" }));
   *   }
   * }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  set: Setter<S>
) => A | Partial<A>;
