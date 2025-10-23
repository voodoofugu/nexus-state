// ------ TYPES ------

type RecordAny = Record<string, any>;
type SetState<T> = (update: Partial<T> | ((prev: T) => Partial<T>)) => void;

type Store<S> = {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`getNexus`*
   * Updates the state with either a partial object or a functional updater.
   * @param key optional state name.
   * @example
   * const entireState = store.getNexus();
   * const specificValue = store.getNexus("key");
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  getNexus(): S;
  getNexus<K extends keyof S>(key: K): S[K];

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`setNexus`*
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
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  setNexus(update: Partial<S> | ((prev: S) => Partial<S>)): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`nexusReset`*
   * Resets state to its initial values.
   * @example
   * store.nexusReset();
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusReset(): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`nexusSubscribe`*
   * Subscribes to changes of specific keys or entire state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys for subscription.
   * @returns an unsubscribe function.
   * @example
   * const unsubscribe = store.nexusSubscribe(
   *   // observer:
   *   (state) => {
   *     console.log("kay changed:", state.kay);
   *   },
   *   // dependencies:
   *   ["key"]
   *   // ["key1", "key2"] - listen to specific state changes
   *   // ["*"] - listen to all state changes
   *   // [] - no subscription
   * );
   *
   * // Unsubscribe
   * unsubscribe();
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: (keyof S)[]
  ): () => void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`nexusGate`*
   * Adds a middleware to intercept state changes before updates.
   * @param middleware function receiving previous and next state.
   * @example
   * store.nexusGate((prevState, nextState) => {
   *   // You can modify nextState, perform side effects or return modified state
   *   return nextState;
   * });
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusGate(middleware: (prevState: S, nextState: S) => S | void): void;
};

type ReactStore<S> = Store<S> & {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`useNexus`*
   * `React` hook to subscribe to entire state or a state value.
   * @param key optional state name.
   * @example
   * const entireState = store.useNexus();
   * const specificValue = store.useNexus("key");
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useNexus: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
   *---
   * ### *`useNexusSelector`*
   * `React` hook for creating derived values from the state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys for subscription.
   * @returns the derived value.
   * @example
   * const derivedValue = store.useNexusSelector(
   *   // observer:
   *   (state) => state.key + 1,
   *   // dependencies:
   *   ["key"]
   *   // ["key1", "key2"] - listen to specific state changes
   *   // ["*"] - listen to all state changes
   *   // [] - no subscription
   * );
   *
   * // ! If the component re-renders often, wrap the observer function in useCallback
   * const derivedValue = store.useNexusSelector(
   *   useCallback((state) => state.key + 1, []),
   *   ["key"]
   * );
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
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
 * ### *`createStore`*
 * Creates a new framework-agnostic store instance.
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
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
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
 * ### *`createReactStore`*
 * Creates an extended store with React bindings and hooks.
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
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
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
 * ### *`createActions`*
 * Defines a group of actions that have access to the internal `setNexus` function.
 * @param create function that receives `setNexus` and has `this` bound to the actions object.
 * @returns actions object containing all defined methods.
 * @example
 * const myActions = createActions((setNexus) => ({
 *   actionName() {
 *     setNexus({ key: "newValue" }); // direct state update
 *     this.anotherAction(); // ! calling another action via "this"
 *   },
 *   anotherAction() {
 *     setNexus((prev) => ({ key: prev.key + "!" })); // functional state update
 *   }
 * }));
 *
 * // Add actions to the ✦store (createStore or createReactStore)
 * const { store, actions } = ✦store({
 *   state: {...},
 *   actions: myActions, // ! supports multiple: [myActions, myAnotherActions]
 * });
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createActions<
  S extends RecordAny,
  A extends RecordAny = RecordAny
>(create: (this: A, setNexus: SetState<S>) => A): (setNexus: SetState<S>) => A;

// ------ NEXUS ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png) NEXUS-STATE
 *---
 * ### *`nexus`*
 * The entire library exported as a single default object.
 *
 * Provides access to the main API functions:
 * - {@link createStore}
 * - {@link createReactStore}
 * - {@link createActions}
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare const nexus: {
  /** Reference to {@link createStore} */
  createStore: <S extends RecordAny, A extends object = object>(options: {
    state: S;
    actions?: (setNexus: SetState<S>) => A;
  }) => {
    state: Store<S>;
    actions: A;
  };
  /** Reference to {@link createReactStore} */
  createReactStore: <S extends RecordAny, A extends object = object>(options: {
    state: S;
    actions?: (setNexus: SetState<S>) => A;
  }) => {
    state: ReactStore<S>;
    actions: A;
  };
  /** Reference to {@link createActions} */
  createActions: <S extends RecordAny, A extends RecordAny = RecordAny>(
    create: (this: A, setNexus: SetState<S>) => A
  ) => (setNexus: SetState<S>) => A;
};

// ------ EXPORT ------

export { createStore, createReactStore, createActions };
export default nexus;
