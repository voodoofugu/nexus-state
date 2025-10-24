// ------ TYPES ------

type RecordAny = Record<string, any>;
type SetState<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;
type Action<A, S> = (
  this: A | Partial<A>,
  setNexus: SetState<S>
) => A | Partial<A>;
type ActionCreate<A, S> = Action<A, S> | Array<Action<A, S>>;

type Store<S> = {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`getNexus:`*
   * updates the state with either a partial object or a functional updater.
   * @param key optional state name.
   * @example
   * const entireState = store.getNexus();
   * const specificValue = store.getNexus("key");
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  getNexus(): S;
  getNexus<K extends keyof S>(key: K): S[K];

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`setNexus:`*
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * // Using a partial object
   * store.setNexus({ key: newValue });
   * store.setNexus({ key: newValue, anotherKey: newValue }); // multiple
   *
   * // Using a functional updater
   * store.setNexus((prevState) => ({
   *   key: prevState.key + 1
   * }));
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  setNexus(update: Partial<S> | ((state: S) => Partial<S>)): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusReset:`*
   * resets state to its initial values.
   * @example
   * store.nexusReset();
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
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
   *   (state) => {
   *     console.log("kay changed:", state.kay);
   *   },
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
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusGate:`*
   * adds a middleware to intercept state changes before updates.
   * @param middleware function receiving previous and next state.
   * @example
   * store.nexusGate((prevState, nextState) => {
   *   // You can modify nextState, perform side effects or return modified state
   *   return nextState;
   * });
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusGate(middleware: (prevState: S, nextState: S) => void | S): void;
};

type ReactStore<S> = Store<S> & {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`useNexus:`*
   * `react` hook to subscribe to entire state or a state value.
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
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`useNexusSelector:`*
   * `react` hook for creating derived values from the state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies array of keys for subscription.
   * @returns the derived value.
   * @example
   * const derivedValue = store.useNexusSelector(
   *   // observer:
   *   (state) => state.key + 1,
   *   // dependencies:
   *   ["key"]
   * );
   *
   * // ! If the component re-renders often, wrap the observer function in useCallback
   * const derivedValue = store.useNexusSelector(
   *   useCallback((state) => state.key + 1, []),
   *   ["key"]
   * );
   *
   * // Dependency options:
   * // ["key1", "key2"] - listen to specific state changes
   * // ["*"] - listen to all state changes
   * // [] - no subscription
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useNexusSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`useUpdate:`*
   * `react` hook for forcing a component re-render.
   * @example
   * const update = store.useUpdate();
   * // call update() to force re-render
   */
  useUpdate: () => React.DispatchWithoutAction;
};

// ------ CORE ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createStore:`*
 * creates a new framework-agnostic store instance.
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
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: {
  state: S;
  actions?: ActionCreate<A, S>;
}): {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`store:`*
   * object containing core methods and custom states.
   *
   * Methods:
   * - `getNexus` — get the entire state or a specific state value
   * - `setNexus` — update the entire state or a specific state value
   * - `nexusReset` — reset the entire state
   * - `nexusSubscribe` — subscribe to changes of specific keys or entire state
   * - `nexusGate` — add a middleware to intercept state changes
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  store: Store<S>;
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`actions:`*
   * object containing custom actions.
   * @example
   * actions.actionName();
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  actions: A;
};

// ------ REACT ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createReactStore:`*
 * creates an extended store with React bindings and hooks.
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
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: {
  state: S;
  actions?: ActionCreate<A, S>;
}): {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`store:`*
   * object containing core methods with react specific hooks and custom states.
   *
   * Methods:
   *
   * **core**
   * - `getNexus` — get the entire state or a specific state value
   * - `setNexus` — update the entire state or a specific state value
   * - `nexusReset` — reset the entire state
   * - `nexusSubscribe` — subscribe to changes of specific keys or entire state
   * - `nexusGate` — add a middleware to intercept state changes
   *
   * **react** ( hooks for rendering and UI updates )
   * - `useNexus` — get the entire state or a specific state value
   * - `useUpdate` — force re-render
   * - `useSubscribe` — subscribe to changes of specific keys or entire state
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  store: ReactStore<S>;
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`actions:`*
   * object containing custom actions.
   * @example
   * actions.actionName();
   * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  actions: A;
};

// ------ ACTIONS ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`createActions:`*
 * defines a group of actions that have access to the internal `setNexus` function.
 * @param create function that receives `setNexus` and has `this` bound to the actions object.
 * @returns actions object containing all defined methods.
 * @example
 * const myActions = createActions((setNexus) => ({
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
 * const { store, actions } = ✦store({ // ✦ createStore or createReactStore
 *   state: {...},
 *   actions: myActions, // ! supports multiple: [myActions, myAnotherActions]
 * });
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare function createActions<
  S extends RecordAny,
  A extends RecordAny = RecordAny
>(create: Action<A, S>): (setNexus: SetState<S>) => A | Partial<A>;

// ------ NEXUS ------

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`nexus:`*
 * the entire library exported as a single default object.
 *
 * Provides access to the main API functions:
 * - {@link createStore}
 * - {@link createReactStore}
 * - {@link createActions}
 * @link [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
declare const nexus: {
  /** More information in import { createStore } */
  createStore: <
    S extends RecordAny = RecordAny,
    A extends RecordAny = RecordAny
  >(options: {
    state: S;
    actions?: ActionCreate<A, S>;
  }) => {
    store: Store<S>;
    actions: A;
  };
  /** More information in import { createReactStore } */
  createReactStore: <
    S extends RecordAny = RecordAny,
    A extends RecordAny = RecordAny
  >(options: {
    state: S;
    actions?: ActionCreate<A, S>;
  }) => {
    store: ReactStore<S>;
    actions: A;
  };
  /** More information in import { createActions } */
  createActions: <S extends RecordAny, A extends RecordAny = RecordAny>(
    create: Action<A, S>
  ) => (setNexus: SetState<S>) => A | Partial<A>;
};

// ------ EXPORT ------

export { createStore, createReactStore, createActions };
export default nexus;
