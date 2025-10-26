import type { Setter, Getter } from "./core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`Store`*:
 * represents a store instance with core methods and user-defined actions.
 *
 * Methods:
 * - `getNexus` — returns the entire state or a specific state value
 * - `setNexus` — updates the state with a partial object or functional updater
 * - `nexusReset` — reset the entire state
 * - `nexusSubscribe` — subscribes to changes of specific keys or entire state
 * - `nexusGate` — register middleware to intercept state changes before updates
 * - `nexusAction` — contains all custom actions
 *
 * @template S Type of initial state
 * @template A Type of actions
 */
interface Store<S, A> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`getNexus:`*
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const entireState = store.getNexus();
   * const specificValue = store.getNexus("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  getNexus: Getter<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`setNexus:`*
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * // Direct state update
   * store.setNexus({ key: newValue });
   * store.setNexus({ key: newValue, anotherKey: newValue }); // multiple
   *
   * // Functional state update
   * store.setNexus((state) => ({ key: state.key + 1 }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  setNexus: Setter<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusReset:`*
   * reset the entire state.
   * @example
   * store.nexusReset();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusReset(): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusSubscribe:`*
   * subscribes to changes of specific keys or entire state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys for subscription.
   * @returns an unsubscribe function.
   * @example
   * const unsubscribe = store.nexusSubscribe(
   *   // observer:
   *   (state) => { console.log("key changed:", state.key); },
   *   // dependencies:
   *   ["key"]
   * );
   *
   * // Unsubscribe
   * unsubscribe();
   *
   * // Dependency options:
   * // ["key1", "key2"] - listen to specific state changes
   * // ["*"] - listen to all state changes
   * // [] - no subscription
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusGate:`*
   * register middleware to intercept state changes before updates.
   * @param middleware function receiving previous and next state.
   * @example
   * store.nexusGate((state, nextState) => {
   *   // You can modify nextState, perform side effects or return modified state
   *   return nextState;
   * });
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusGate(middleware: (state: S, nextState: S) => void | S): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusAction:`*
   * contains all custom actions.
   * @example
   * store.nexusAction.actionName();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusAction: A;
}

export type { Store };
