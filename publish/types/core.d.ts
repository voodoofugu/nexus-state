type RecordAny = Record<string, any>;

type Setter<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;

type Getter<S> = {
  (): S;
  <K extends keyof S>(key: K): S[K];
};

type CreateActs<A, S> = {
  (
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***this***:
     * refers to the acts object or a partial of it.
     * @example
     * actionA() { this.actionB(); }
     * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
     */
    this: A | Partial<A>,
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***get***:
     * returns the entire state or a specific state value.
     * @param key optional state name.
     * @example
     * const entireState = get();
     * const specificValue = get("key");
     * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
     */
    get: Getter<S>,
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***set***:
     * updates the state with a partial object or functional updater.
     * @param update partial object or function with access to all states.
     * @example
     * // Direct state update
     * set({ key: newValue });
     * set({ key: newValue, anotherKey: newValue }); // multiple
     *
     * // Functional state update
     * set((state) => ({ key: state.key + 1 }));
     * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
     */
    set: Setter<S>
  ): A | Partial<A>;
};

type CreateActsUnion<A, S> = CreateActs<A, S> | Array<CreateActs<A, S>>;

export type { RecordAny, Setter, Getter, CreateActs, CreateActsUnion };
