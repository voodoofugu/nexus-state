/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***RecordAny***:
 * internal object shape used by generic nexus state and acts constraints.
 * @description
 * Public APIs infer concrete state and action types from your config. Use
 * `RecordAny` only when you need to write helper types that accept any
 * object-shaped nexus state or acts object.
 * @example
 * ```ts
 * function logState<S extends RecordAny>(state: S) {
 *   console.log(state);
 * }
 * ```
 */
type RecordAny = Record<string, any>;
type KnownSource = "manual" | "storage" | "server" | "external" | "reset";
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Source***:
 * update source label carried by `set`, `middleware` and subscribers.
 * @description
 * Known sources are autocompleted (`"manual"`, `"storage"`, `"server"`,
 * `"external"`, `"reset"`), but any custom string is allowed.
 * @example
 * ```ts
 * nexus.set({ user }, "server");
 * nexus.set({ count: 0 }, { source: "reset" });
 * ```
 */
type Source = KnownSource | (string & {});
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***UpdateContext***:
 * trace metadata describing where a state update came from.
 * @description
 * The same context is passed through middleware and subscribers, so persistence,
 * sync, analytics or devtools can distinguish a user update from hydration,
 * server data or a reset.
 * @example
 * ```ts
 * nexus.set(
 *   { profile },
 *   { source: "server", meta: { requestId: "abc" } },
 * );
 * ```
 */
type UpdateContext = {
    source: Source;
    meta?: RecordAny;
};
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***SetContext***:
 * context accepted by `set`.
 * @description
 * Pass either a full `UpdateContext` object or a string shortcut equivalent to
 * `{ source: "your-source" }`.
 * @example
 * ```ts
 * set({ count: 1 }, "manual");
 * set({ count: 1 }, { source: "manual", meta: { button: "plus" } });
 * ```
 */
type SetContext = Source | UpdateContext;
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Setter***:
 * updates the state with a partial object or functional updater.
 * @param update partial object or function with access to the full current state.
 * @param context optional string or context object with `source` and optional `meta`.
 * @example
 * ```ts
 * // Direct state update
 * set({ key: newValue });
 * set({ key: newValue, anotherKey: newValue }); // multiple
 *
 * // Functional state update
 * set((state) => ({ key: state.key + 1 }));
 *
 * // With context for `middleware` and subscribers
 * set({ key: newValue }, { source: "server", meta: { requestId } });
 *
 * // Shortcut equivalent to { source: "server" }
 * set({ key: newValue }, "server");
 * ```
 */
type Setter<S> = (update: Partial<S> | ((state: S) => Partial<S>), context?: SetContext) => void;
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Getter***:
 * reads the whole state or one typed state key.
 * @description
 * `get()` returns the complete state object. `get("key")` returns the value for
 * that key with its exact inferred type.
 * @example
 * ```ts
 * const state = get();
 * const count = get("count");
 * ```
 */
type Getter<S> = {
    (): S;
    <K extends keyof S>(key: K): S[K];
};
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Middleware***:
 * intercepts every state update before subscribers are notified.
 * @param prevState state before the update.
 * @param nextState state after applying the original partial update.
 * @param context optional update context passed to `set`.
 * @returns a replacement state to override the update, or `void` to keep `nextState`.
 * @example
 * ```ts
 * const stop = nexus.middleware((prev, next, context) => {
 *   if (context?.source === "server") return next;
 *   return { ...next, updatedAt: Date.now() };
 * });
 * ```
 */
type Middleware<S> = (prevState: S, nextState: S, context?: UpdateContext) => S | void;
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Observer***:
 * subscriber callback called after a relevant state update.
 * @param state latest complete state.
 * @param context optional update context passed to `set`.
 * @example
 * ```ts
 * const stop = nexus.subscribe((state, context) => {
 *   console.log(state.count, context?.source);
 * }, ["count"]);
 * ```
 */
type Observer<S> = (state: S, context?: UpdateContext) => void;
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Dependencies***:
 * keys that control when a subscriber or selector should update.
 * @description
 * Always passed explicitly for `subscribe` and `useSelector`, so every
 * subscription states what it depends on. Pass a list of state keys for
 * key-level subscriptions, or `["*"]` to watch every key.
 * @example
 * ```ts
 * nexus.subscribe(observer, ["count", "name"]); // specific keys
 * nexus.subscribe(observer, ["*"]); // watch every key
 * ```
 */
type Dependencies<S> = ["*"] | (keyof S)[];
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***EqualityFn***:
 * compares the previous and next result of a `useSelector` selector.
 * @description
 * Returns `true` to keep the previous value (skip the re-render). Defaults to
 * `Object.is` semantics. Pass the exported `shallow` helper for one-level
 * object/array equality, or a custom function for anything else.
 * @example
 * ```ts
 * const isEqual: EqualityFn<number[]> = (a, b) =>
 *   a.length === b.length && a.every((v, i) => v === b[i]);
 * ```
 */
type EqualityFn<T> = (a: T, b: T) => boolean;
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Nexus***:
 * framework-agnostic nexus store instance.
 * @description
 * A nexus owns state, actions, middleware and subscriptions. It has no React
 * dependency and can be used in plain JavaScript, TypeScript, services or tests.
 * @example
 * ```ts
 * const nexus = createNexus({
 *   state: { count: 0 },
 * });
 *
 * nexus.set({ count: 1 });
 * nexus.get("count"); // number
 * ```
 */
interface Nexus<S, A = Record<string, never>> {
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***get***:
     * reads the whole state or one typed state key.
     * @example
     * ```ts
     * const state = nexus.get();
     * const count = nexus.get("count");
     * ```
     */
    get: Getter<S>;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***set***:
     * updates the state with a partial object or functional updater.
     * @description
     * A single `set` call notifies subscribers once, even when several keys
     * change — this is the primary way to batch. `set` calls made synchronously
     * inside an action are also batched into a single notification; calls made
     * after an `await` run as separate updates.
     * @param update partial object or function with access to all state.
     * @param context optional string or context object with `source` and optional `meta`.
     * @example
     * ```ts
     * nexus.set({ count: 1 });
     * nexus.set((state) => ({ count: state.count + 1 }), "manual");
     * nexus.set({ user }, { source: "server", meta: { requestId } });
     * ```
     */
    set: Setter<S>;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***reset***:
     * restores all state or selected keys to their initial values.
     * @description
     * Reset updates are routed through `set` with source `"reset"`, so middleware
     * and subscribers observe them like normal updates.
     * @param keys optional state keys to reset. Omit keys to reset everything.
     * @example
     * ```ts
     * nexus.reset();
     * nexus.reset("count", "name");
     * ```
     */
    reset(...keys: (keyof S)[]): void;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***subscribe***:
     * listens to all updates or only selected state keys.
     * @param observer callback called with latest state and optional update context.
     * @param dependencies keys to watch (required, so the subscription is always explicit). Pass `["*"]` to watch every key.
     * @returns unsubscribe function.
     * @example
     * ```ts
     * const stop = nexus.subscribe((state, context) => {
     *   console.log(state.count, context?.source);
     * }, ["count"]);
     *
     * stop();
     * ```
     */
    subscribe(observer: Observer<S>, dependencies: Dependencies<S>): () => void;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***middleware***:
     * adds an update interceptor for this nexus.
     * @description
     * Middleware runs before state is committed and before subscribers are
     * notified. Return a replacement state to override the update.
     * @param fn middleware callback.
     * @returns function that removes this middleware.
     * @example
     * ```ts
     * const stop = nexus.middleware((prev, next, context) => {
     *   if (context?.source === "storage") return next;
     *   return { ...next, touched: true };
     * });
     * ```
     */
    middleware(fn: Middleware<S>): () => void;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***acts***:
     * action object created from the `acts` option.
     * @description
     * Actions are bound to the final acts object, so destructured methods and
     * cross-action `this.someAction()` calls keep working.
     * @example
     * ```ts
     * nexus.acts.increment();
     * const { increment } = nexus.acts;
     * increment();
     * ```
     */
    acts: A;
}
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***Computed***:
 * a cached, subscribable derived value produced by `computed`.
 * @description
 * Read the current value with `get()`, react to changes with `subscribe()`, and
 * release its subscription to the source nexus with `dispose()`. The value is
 * recomputed only when a tracked key changes and only notifies when the result
 * changes (by the chosen equality).
 * @example
 * ```ts
 * const total = computed(nexus, (s) => s.a + s.b);
 * total.get();
 * const off = total.subscribe((v) => console.log(v));
 * ```
 */
interface Computed<R> {
    get(): R;
    subscribe(listener: (value: R) => void): () => void;
    dispose(): void;
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***computed***:
 * a cached, subscribable value derived from a nexus.
 * @description
 * Unlike `useSelector` (which derives per-component, React-only), a `computed` is
 * defined **once** and shared: it recomputes a single time when its inputs change
 * and every consumer reads the same cached value. Framework-agnostic — usable in
 * actions, middleware, other computeds, or React (via `useComputed`).
 *
 * The keys the `selector` reads are tracked automatically (shallow proxy), so it
 * only recomputes when a key it actually uses changes. It notifies subscribers
 * only when the **result** changes — `Object.is` by default, `"shallow"` or a
 * custom comparator otherwise. Read state through the `selector` argument, not
 * `nexus.get()`, or the read won't be tracked.
 * @param nexus source nexus (from `createNexus` or `createReactNexus`).
 * @param selector derives a value from the full state.
 * @param isEqual optional result comparator: `"shallow"` or `(a, b) => boolean`.
 * @returns a `Computed` with `get`, `subscribe` and `dispose`.
 * @example
 * ```ts
 * import { computed } from "nexus-state/computed";
 *
 * const total = computed(nexus, (s) => s.cart.reduce((n, i) => n + i.price, 0));
 * total.get(); // current total
 * const off = total.subscribe((v) => console.log("total:", v));
 * ```
 */
declare function computed<S extends RecordAny, R>(nexus: Nexus<S, RecordAny>, selector: (state: S) => R, isEqual?: "shallow" | EqualityFn<R>): Computed<R>;

export { computed, computed as default };
export type { Computed };
