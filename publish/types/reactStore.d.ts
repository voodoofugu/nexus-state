import type { Store } from "./store";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`ReactStore`*:
 * represents a store instance with core methods, user-defined actions, and React Hooks.
 *
 * Methods:
 *
 * **core**
 * - `getNexus` — returns the entire state or a specific state value
 * - `setNexus` — updates the state with a partial object or functional updater
 * - `nexusReset` — reset the entire state
 * - `nexusSubscribe` — subscribes to changes of specific keys or entire state
 * - `nexusGate` — register middleware to intercept state changes before updates
 * - `nexusAction` — contains all custom actions
 *
 * **react** ( hooks for rendering and UI updates )
 * - `useNexus` — returns the entire state or a specific state value
 * - `useNexusUpdate` — force re-render
 * - `useNexusSelector` — subscribe to changes of specific keys or entire state
 *
 * @template S Type of initial state
 * @template A Type of actions
 */
interface ReactStore<S, A> extends Store<S, A> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`useNexus:`*
   * `react` hook to subscribe to entire state or a state value.
   * @param key optional state name.
   * @example
   * const entireState = store.useNexus();
   * const specificValue = store.useNexus("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useNexus: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`useNexusUpdate:`*
   * `react` hook for forcing a component re-render.
   * @example
   * const update = store.useNexusUpdate();
   * // call update() to force re-render
   */
  useNexusUpdate: () => React.DispatchWithoutAction;

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
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useNexusSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`nexusAction:`*
   * contains all custom actions
   * @example
   * store.nexusAction.actionName();
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  nexusAction: A;
}

export type { ReactStore };
