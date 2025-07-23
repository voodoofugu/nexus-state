type Middleware<T> = (prevState: T, nextState: T) => T | void;
type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

// ------ CORE ------
interface Store<T> {
  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Returns the current state or a specific key.
   */
  getNexus(): T;
  getNexus<K extends keyof T>(key: K): T[K];

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Updates the state with a partial object or functional updater.
   */
  setNexus: SetState<T>;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Resets state to its initial values.
   */
  nexusReset(): void;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Subscribes to changes of specific keys or entire state.
   * Returns an unsubscribe function.
   */
  nexusSubscribe(keys: (keyof T)[] | "*", listener: () => void): () => void;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Adds a middleware to intercept state changes before updates.
   */
  nexusGate(fn: Middleware<T>): void;
}

/**---
 * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * Creates a new core store instance.
 * @param options Store configuration including initial state and optional actions.
 * @returns Store instance with state methods and optional actions.
 */
declare function createStore<
  T extends Record<string, unknown>,
  A extends object = object
>(options: {
  state: T;
  actions?: (set: SetState<T>) => A;
}): {
  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Core store instance.
   */
  state: Store<T>;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Optional actions object.
   */
  actions: A;
};

// ------ REACT ------
interface CreateReactStoreOptions<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: unknown[]) => unknown>
> {
  state: T;
  actions?: (
    set: (updater: Partial<T> | ((prev: T) => Partial<T>)) => void
  ) => A;
}

/**---
 * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
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
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * State instance including React-specific hooks and core API.
   */
  state: Store<T> & {
    /**---
     * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * React hook to subscribe to entire state or a specific key.
     */
    useNexus: {
      (): T;
      <K extends keyof T>(key: K): T[K];
    };

    /**---
     * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * React hook for computed/derived values.
     * Re-renders only when specified dependencies change.
     */
    useNexusSelector: <R>(
      selector: (state: T) => R,
      dependencies: (keyof T)[]
    ) => R;
  };

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Optional actions object for interacting with the state.
   */
  actions: A;
};

export { createStore, createReactStore };
