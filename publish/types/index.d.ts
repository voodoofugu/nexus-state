import createStore from "../store-core";
import createReactStore from "../store-react";

/**---
 * Middleware function type.
 *
 * Intercepts state changes before they are applied.
 *
 * Returning a new state overrides the next state.
 */
type Middleware<T> = (prevState: T, nextState: T) => T | void;

/**---
 * SetState function type.
 *
 * Updates the store state partially or via functional updater.
 */
type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

/**---
 * Core Store Interface.
 *
 * Exposes core methods for managing state.
 */
interface Store<T> {
  /**---
   * Returns the current state object.
   */
  getNexus(): T;

  /**---
   * Updates the state with a partial object or functional updater.
   */
  setNexus: SetState<T>;

  /**---
   * Resets state to its initial values.
   */
  nexusReset(): void;

  /**---
   * Subscribes to changes of specific keys or entire state.
   *
   * Returns an unsubscribe function.
   */
  nexusSubscribe(keys: (keyof T)[] | "*", listener: () => void): () => void;

  /**---
   * Adds a middleware to intercept state changes before updates.
   */
  nexusGate(fn: Middleware<T>): void;
}

/**---
 * Creates a new core store instance.
 * @param options Store configuration including initial state and optional actions.
 * @returns Store instance with state methods and optional actions.
 */
declare function createStore<
  T extends Record<string, unknown>,
  A extends object = object
>(options: {
  /**---
   * Initial state object.
   */
  state: T;

  /**---
   * Optional actions creator for defining store actions.
   */
  actions?: (set: SetState<T>) => A;
}): {
  /**---
   * Core store instance.
   */
  state: Store<T>;

  /**---
   * Optional actions object.
   */
  actions: A;
};

/**---
 * React Store Options.
 *
 * Defines state and optional actions for React store.
 */
interface CreateReactStoreOptions<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: unknown[]) => unknown>
> {
  /**---
   * Initial state object.
   */
  state: T;

  /**---
   * Optional actions creator.
   */
  actions?: (
    set: (updater: Partial<T> | ((prev: T) => Partial<T>)) => void
  ) => A;
}

/**---
 * Creates a React-specific store with React bindings.
 * @param options Store configuration.
 * @returns Store instance with React hooks and core store methods.
 */
declare function createReactStore<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: any[]) => unknown> = Record<
    string,
    (...args: unknown[]) => unknown
  >
>(
  options: CreateReactStoreOptions<T, A>
): {
  /**---
   * State instance including React-specific hooks and core API.
   */
  state: {
    /**---
     * React hook to subscribe to entire state or a specific key.
     */
    useNexus: {
      (): T;
      <K extends keyof T>(key: K): T[K];
    };

    /**---
     * React hook for computed/derived values.
     *
     * Re-renders only when specified dependencies change.
     */
    useNexusSelector: <R>(
      selector: (state: T) => R,
      dependencies: (keyof T)[]
    ) => R;

    getNexus(): T;
    setNexus: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
    nexusReset(): void;
    nexusSubscribe(keys: "*" | (keyof T)[], listener: () => void): () => void;
    nexusGate(fn: (prevState: T, nextState: T) => void | T): void;
  };

  /**---
   * Optional actions object for interacting with the state.
   */
  actions: A;
};

export { createStore, createReactStore };
