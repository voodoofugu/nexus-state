import type { Setter, Getter } from "./core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`Store`*:
 * represents a store instance with core methods and user-defined acts.
 *
 * Methods:
 * - `get` — returns the entire state or a specific state value
 * - `set` — updates the state with a partial object or functional updater
 * - `reset` — reset the entire state
 * - `subscribe` — subscribes to changes of specific keys or entire state
 * - `middleware` — register middleware to intercept state changes before updates
 * - `acts` — contains all custom actions
 *
 * @template S Type of initial state
 * @template A Type of acts
 */
interface Store<S, A> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`get:`*
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const entireState = store.get();
   * const specificValue = store.get("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  get: Getter<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`set:`*
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * // Direct state update
   * store.set({ key: newValue });
   * store.set({ key: newValue, anotherKey: newValue }); // multiple
   *
   * // Functional state update
   * store.set((state) => ({ key: state.key + 1 }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  set: Setter<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`reset:`*
   * reset the entire state.
   * @example
   * store.reset();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  reset(): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`subscribe:`*
   * subscribes to changes of specific keys or entire state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies keys to subscribe to. Use `["*"]` to listen to all.
   * @returns an unsubscribe function.
   * @example
   * const unsubscribe = store.subscribe(
   *   (state) => { console.log("key changed:", state.key); },
   *   ["key"]
   * );
   *
   * // Unsubscribe
   * unsubscribe();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  subscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`middleware:`*
   * register middleware to intercept state changes before updates.
   * @param middleware function receiving previous and next state.
   * @example
   * store.middleware((state, nextState) => {
   *   // You can modify nextState, perform side effects or return modified state
   *   return nextState;
   * });
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  middleware(middleware: (state: S, nextState: S) => void | S): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`acts:`*
   * contains all custom actions.
   * @example
   * store.acts.actionName();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  acts: A;
}

export type { Store };
