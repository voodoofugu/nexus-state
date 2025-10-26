type RecordAny = Record<string, any>;

type Setter<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;

type Getter<S> = {
  (): S;
  <K extends keyof S>(key: K): S[K];
};

type ActionCreate<A, S> = (
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`this`*:
   * refers to the actions object or a partial of it.
   * @example
   * {
   *   actionA() { this.actionB(); }
   * }
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  this: A | Partial<A>,
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`getNexus`*:
   * returns the entire state or a specific state value.
   * @param key optional state name.
   * @example
   * const entireState = getNexus();
   * const specificValue = getNexus("key");
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  getNexus: Getter<S>,
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### *`setNexus`*:
   * updates the state with a partial object or functional updater.
   * @param update partial object or function with access to all states.
   * @example
   * // Direct state update
   * setNexus({ key: newValue });
   * setNexus({ key: newValue, anotherKey: newValue }); // multiple
   *
   * // Functional state update
   * setNexus((state) => ({ key: state.key + 1 }));
   * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
   */
  setNexus: Setter<S>
) => A | Partial<A>;
type ActionCreateUnion<A, S> = ActionCreate<A, S> | Array<ActionCreate<A, S>>;

export type { RecordAny, Setter, Getter, ActionCreate, ActionCreateUnion };
