import type { Nexus } from "./nexusCore";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***ReactNexus***:
 * represents a store instance with core methods and React Hooks.
 *
 * Methods:
 *
 * **core**
 * - `get` — returns the entire state or a specific state value
 * - `set` — updates the state with a partial object or functional updater
 * - `reset` — reset the entire state or specific keys
 * - `subscribe` — subscribes to changes of specific keys or entire state
 * - `middleware` — register middleware to intercept state changes before updates
 * - `acts` — contains all custom actions
 *
 * **react** ( hooks for rendering and UI updates )
 * - `use` — returns the entire state or a specific state value
 * - `useRerender` — force re-render
 * - `useSelector` — subscribe to changes of specific keys or entire state
 *
 * @template S Type of initial state
 * @template A Optional type of acts
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
interface ReactNexus<S, A> extends Nexus<S, A> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***use***:
   * `react` hook to subscribe to entire state or a state value.
   * @param key optional state name.
   * @example
   * const entireState = nexus.use();
   * const specificValue = nexus.use("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  use: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***useRerender***:
   * `react` hook for forcing a component re-render.
   * @example
   * const update = nexus.useRerender();
   * // call update() to force re-render
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useRerender: () => React.DispatchWithoutAction;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***useSelector***:
   * `react` hook for creating derived values from the state.
   * @param observer callback function to be called when the state changes.
   * @param dependencies keys to subscribe to. Use `["*"]` to listen to all.
   * @returns the derived value.
   * @example
   * const derivedValue = nexus.useSelector(
   *   (state) => state.key + 1,
   *   ["key"]
   * );
   *
   * // ! If the component re-renders often, wrap the observer in useCallback
   * useCallback((state) => state.key + 1, [])
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  useSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;

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

export type { ReactNexus };
