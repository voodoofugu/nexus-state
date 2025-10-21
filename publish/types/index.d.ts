// ------ TYPES ------

type RecordAny = Record<string, any>;
type SetState<T> = (update: Partial<T> | ((prev: T) => Partial<T>)) => void;

type Store<S> = {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Updates the state with either a partial object or a functional updater.
   * @param key optional string key.
   * @example
   * const entireState = store.getNexus();
   * const specificValue = store.getNexus("key");
   */
  getNexus(): S;
  getNexus<K extends keyof S>(key: K): S[K];

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Updates the state with a partial object or functional updater.
   * @param update partial object or function with the previous state.
   * @example
   * // Using a partial object
   * store.setNexus({ key: newValue });
   * store.setNexus({ key: newValue, anotherKey: newValue }); // multiple updates
   *
   * // Using a functional updater
   * store.setNexus((prevState) => ({
   *   key: prevState.key + 1
   * }));
   */
  setNexus(update: Partial<S> | ((prev: S) => Partial<S>)): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Resets state to its initial values.
   * @example
   * store.nexusReset();
   */
  nexusReset(): void;

  /**---
   * ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * Subscribes to changes of specific keys or entire state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys to subscribe to or empty array for entire state.
   * @returns an unsubscribe function.
   * @example
   * const unsubscribe = store.nexusSubscribe((state) => {
   *   console.log("State changed:", state);
   * });
   */
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: (keyof S)[]
  ): () => void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Adds a middleware to intercept state changes before updates.
   * @param middleware function receiving previous and next state.
   * @example
   * store.nexusGate((prevState, nextState) => {
   *   // You can modify nextState, perform side effects or return modified state
   *   return nextState;
   * });
   */
  nexusGate(middleware: (prevState: S, nextState: S) => S | void): void;
};

type ReactStore<S> = Store<S> & {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * `React` hook to subscribe to entire state or a state value.
   * @param key optional string key.
   * @example
   * const entireState = store.useNexus();
   * const specificValue = store.useNexus("key");
   */
  useNexus: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * `React` hook for creating derived values from the state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys to subscribe to or empty array for entire state.
   * @returns the derived value.
   * @example
   * const derivedValue = store.useNexusSelector(
   *   (state) => state.key + 1,
   *   ["key"]
   * );
   */
  useNexusSelector: <R>(
    observer: (state: S) => R,
    dependencies: (keyof S)[]
  ) => R;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * `React` hook for forcing a component re-render.
   * @example
   * const update = store.useUpdate();
   * // Call update() to force re-render
   */
  useUpdate: () => React.DispatchWithoutAction;
};

// ------ CORE ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
 *---
 * Creates a new core store instance.
 * @param options store configuration including entire initial `state` and optional `actions`.
 * @returns store instance with methods and actions.
 * @example
 * const { store, actions } = createStore({
 *   state: {
 *     key: "initialValue"
 *   },
 *
 *   actions: (setNexus) => ({
 *     actionName() { setNexus({ key: "newValue" }); }
 *   })
 * })
 */
declare function createStore<
  S extends RecordAny,
  A extends object = object
>(options: {
  state: S;
  actions?: (setNexus: SetState<S>) => A;
}): {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Core store instance with state methods.
   */
  state: Store<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Optional actions object.
   */
  actions: A;
};

// ------ REACT ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
 *---
 * Creates a store with React bindings.
 * @param options Store configuration including entire initial `state` and optional `actions`.
 * @returns store instance with React Hooks, `createStore` methods and actions.
 * @example
 * const { store, actions } = createReactStore({
 *   state: {
 *     key: "initialValue"
 *   },
 *
 *   actions: (setNexus) => ({
 *     actionName() { setNexus({ key: "newValue" }); }
 *   })
 * })
 */
declare function createReactStore<
  S extends RecordAny,
  A extends object = object
>(options: {
  state: S;
  actions?: (setNexus: SetState<S>) => A;
}): {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * State instance including React-specific hooks and core API.
   */
  state: ReactStore<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * Optional actions object.
   */
  actions: A;
};

// ------ ACTIONS ------
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
 *---
 * Defines a group of actions that have access to the internal `setNexus` function.
 * @param create function that returns an object containing action methods.
 * @example
 * const myActions = createActions((setNexus) => ({
 *   actionName() {
 *     setNexus({ key: "newValue" });
 *   },
 * }));
 *
 * // Add actions to the ✦store (createStore or createReactStore)
 * const { store, actions } = ✦store({
 *   state: {...},
 *   actions: myActions, // ! or provide multiple: [myActions, myAnotherActions]
 * });
 */
declare function createActions<
  S extends RecordAny,
  A extends RecordAny = RecordAny
>(create: (this: A, setNexus: SetState<S>) => A): (setNexus: SetState<S>) => A;

export { createStore, createReactStore, createActions };
