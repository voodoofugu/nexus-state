type RecordAny = Record<string, any>;

type Source = "manual" | "server" | "server" | "external";
type Setter<S> = {
  (
    update: Partial<S> | ((state: S) => Partial<S>),
    context?: { source: string; meta?: Record<string, any> }
  ): void;
  (update: Partial<S> | ((state: S) => Partial<S>), context?: Source): void;
  (update: Partial<S> | ((state: S) => Partial<S>), context?: string): void;
};

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
     */
    get: Getter<S>,
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***set***:
     * updates the state with a partial object or functional updater.
     * @param update partial object or function with access to all states.
     * @param context optional string or context object with `source` and optional `meta`.
     * @example
     * // Direct state update
     * set({ key: newValue });
     * set({ key: newValue, anotherKey: newValue }); // multiple
     *
     * // Functional state update
     * set((state) => ({ key: state.key + 1 }));
     *
     * // With context for `middleware`
     * set({ key: newValue }, { source: "server", meta: { ... } });
     *
     * // Shortcut equivalent to { source: "server" }
     * set({ key: newValue }, "server");
     */
    set: Setter<S>
  ): A | Partial<A>;
};

type CreateActsUnion<A, S> = CreateActs<A, S> | Array<CreateActs<A, S>>;

export type { RecordAny, Setter, Getter, CreateActs, CreateActsUnion };
