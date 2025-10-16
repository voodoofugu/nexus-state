type Middleware<T> = (prevState: T, nextState: T) => T | void;
type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

// ------ CORE ------
interface Store<T> {
  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Returns the entire state or a specific state value.
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
   * @param observer Callback function to be called when the state changes.
   * @param dependencies Array of keys to subscribe to or empty array for entire state.
   * @returns An unsubscribe function.
   */
  nexusSubscribe(
    observer: (state: T) => void,
    dependencies: (keyof T)[]
  ): () => void;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Adds a middleware to intercept state changes before updates.
   */
  nexusGate(fn: Middleware<T>): void;
}

/**---
 * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * Creates a new core store instance.
 * @param options Store configuration including entire initial `state` and optional `actions`.
 * @returns Store instance with state methods and actions.
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
 * Creates a store with React bindings.
 * @param options Store configuration including entire initial `state` and optional `actions`.
 * @returns Store instance with React Hooks and `createStore` methods.
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
     * `React` hook to subscribe to entire state or a state value.
     */
    useNexus: {
      (): T;
      <K extends keyof T>(key: K): T[K];
    };

    /**---
     * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * `React` hook for creating derived values from the state.
     * @param observer Callback function to be called when the state changes.
     * @param dependencies Array of keys to subscribe to or empty array for entire state.
     * @returns The derived value.
     */
    useNexusSelector: <R>(
      observer: (state: T) => R,
      dependencies: (keyof T)[]
    ) => R;

    /**---
     * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * `React` hook for forcing a component re-render.
     */
    useUpdate: () => void;
  };

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Optional actions object for interacting with the state.
   */
  actions: A;
};

// ------ ACTIONS FACTORIES ------
/**---
 * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * Creates a monolithic action factory.
 * @param factory Action factory function.
 * @returns Action factory function.
 */
declare function createActions<
  S extends Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(factory: (this: A, set: SetState<S>) => A): (set: SetState<S>) => A;

/**---
 * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * Creates a discrete action factory.
 * @param factory Action factory function.
 * @returns Action factory function.
 */
declare function createDiscreteActions<
  S extends Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(
  factory: (this: Partial<A>, set: SetState<S>) => Partial<A>
): (set: SetState<S>) => Partial<A>;

export { createStore, createReactStore, createActions, createDiscreteActions };
