import type { Setter, Getter } from "./core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Nexus***:
 * represents a store instance with core methods.
 *
 * Methods:
 * - `get` — returns the entire state or a specific state value
 * - `set` — updates the state with a partial object or functional updater
 * - `reset` — reset the entire state or specific keys
 * - `subscribe` — subscribes to changes of specific keys or entire state
 * - `middleware` — register middleware to intercept state changes before updates
 * - `acts` — contains all custom actions
 *
 * @template S Type of initial state
 * @template A Optional type of actsType of acts
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
interface Nexus<S, A> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***get***:
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const entireState = nexus.get();
   * const specificValue = nexus.get("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  get: Getter<S>;

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
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  set: Setter<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***reset***:
   * reset the entire state or specific keys.
   * @example
   * nexus.reset(); // reset entire state
   * nexus.reset("key", "anotherKey");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  reset(...keys: (keyof S)[]): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***subscribe***:
   * subscribes to changes of specific keys or entire state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies keys to subscribe to. Use `["*"]` to listen to all.
   * @returns an unsubscribe function.
   * @example
   * const unsubscribe = nexus.subscribe(
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
   * ### ***middleware***:
   * register a middleware to intercept and modify state updates.
   * @param fn middleware function receiving prev state, next state and context.
   * @example
   * nexus.middleware((prev, next, context) => {
   *   if (context.source === "storage") {
   *     console.log("Loaded from storage:", next);
   *   }
   *   // You can return a modified state or perform side effects
   *   return next;
   * });
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  middleware(
    fn: (
      /**---
       * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
       * ### ***prev***:
       * previous state before the update.
       */
      prev: S,
      /**---
       * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
       * ### ***next***:
       * next state after the update.
       */
      next: S,
      /**---
       * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
       * ### ***context***:
       * context of the update, including its source and optional meta info.
       * @example
       * if (context.source === "server") {
       *   // do something
       * }
       */
      context?: {
        /**---
         * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
         * ### ***source***:
         * name of the update source (e.g., "manual", "server", "server").
         * @default "manual"
         */
        source: string;
        /**---
         * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
         * ### ***meta***:
         * optional additional metadata.
         */
        meta?: Record<string, any>;
      }
    ) => void | S
  ): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***acts***:
   * contains all custom actions.
   * @example
   * nexus.acts.actionName();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  acts: A;
}

export type { Nexus };
