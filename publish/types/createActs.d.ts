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
   * const entireState = nexus.get();
   * const specificValue = nexus.get("key");
   */
  get: Getter<S>,
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***set***:
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @param context optional string or context object with `source` and optional `meta`.
   * @example
   * // Direct state update
   * set({ key: newValue });
   * set({ key: newValue, anotherKey: newValue }); // multiple
   *
   * // Functional state update
   * set((state) => ({ key: state.key + 1 }));
   *
   * // With context for `middleware`
   * set({ key: newValue }, { source: "server", meta: { ... } });
   *
   * // Shortcut equivalent to { source: "server" }
   * set({ key: newValue }, "server");
   */
  set: Setter<S>
) => A | Partial<A>;
