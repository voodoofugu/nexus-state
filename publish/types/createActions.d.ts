import type { RecordAny, Setter, Getter, ActionCreate } from "./core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createActions`*:
 * defines a group of actions.
 * @param create function that receives `getNexus` and `setNexus` with `this` bound to the actions object.
 * @returns actions object.
 * @example
 * const myActions = createActions((getNexus, setNexus) => ({
 *   actionName() {
 *     setNexus({ key: "newValue" }); // direct state update
 *     this.anotherAction(); // ! calling another action
 *   },
 *   anotherAction() {
 *     setNexus((state) => ({ key: state.key + "!" })); // functional state update
 *   }
 * }));
 *
 * // Usage:
 * const { store, actionStore } = ✦store({ // ✦ createStore or createReactStore
 *   state: {...},
 *   actions: myActions, // ! supports multiple: [myActions, myAnotherActions]
 * });
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createActions<
  S extends RecordAny,
  A extends RecordAny = RecordAny
>(
  create: ActionCreate<A, S>
): (
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`getNexus`*:
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const myActions = createActions((getNexus) => ({
   *   actionName() {
   *    const specificValue = getNexus("key");
   *    console.log("specificValue:", specificValue);
   *   }
   * }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  getNexus: Getter<S>,
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`setNexus`*:
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * const myActions = createActions((_, setNexus) => ({
   *   actionName() {
   *     // Direct state update
   *     setNexus({ key: "newValue" });
   *
   *     // Functional state update
   *     setNexus((state) => ({ key: state.key + "!" }));
   *   }
   * }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  setNexus: Setter<S>
) => A | Partial<A>;
