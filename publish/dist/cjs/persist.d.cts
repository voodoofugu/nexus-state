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
 * Use `["*"]` for every update, or a list of state keys for key-level
 * subscriptions.
 * @example
 * ```ts
 * nexus.subscribe(observer, ["count", "name"]);
 * nexus.subscribe(observer, ["*"]);
 * ```
 */
type Dependencies<S> = ["*"] | (keyof S)[];
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
     * change. Multiple `set` calls inside one action are also batched and notify
     * once after the action finishes.
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
     * @param dependencies keys to watch, or `["*"]` for every update.
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
    subscribe(observer: Observer<S>, dependencies?: Dependencies<S>): () => void;
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
 * ### ***PersistStorage***:
 * minimal synchronous storage contract used by `persist`.
 * @description
 * `localStorage` satisfies this interface. Custom storage is useful for tests,
 * memory adapters, encrypted storage or platform-specific persistence.
 * @example
 * ```ts
 * const cache: Record<string, string> = {};
 *
 * const memoryStorage: PersistStorage = {
 *   getItem: (key) => cache[key] ?? null,
 *   setItem: (key, value) => {
 *     cache[key] = value;
 *   },
 *   removeItem: (key) => {
 *     delete cache[key];
 *   },
 * };
 * ```
 */
interface PersistStorage {
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***getItem***:
     * reads a persisted string value by key.
     * @returns persisted value, or `null` when no value exists.
     */
    getItem(key: string): string | null;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***setItem***:
     * writes a serialized string value by key.
     */
    setItem(key: string, value: string): void;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***removeItem***:
     * removes a persisted value by key.
     */
    removeItem(key: string): void;
}
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***PersistOptions***:
 * configuration object accepted by `persist`.
 * @description
 * Controls where state is stored, which keys are persisted and how older
 * snapshots are migrated.
 * @example
 * ```ts
 * persist(nexus, {
 *   key: "counter",
 *   include: ["count"],
 *   version: 2,
 *   migrate: (state, from) => from === 1 ? { count: state.value } : state,
 * });
 * ```
 */
interface PersistOptions<S> {
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***key***:
     * storage key used for the persisted snapshot.
     */
    key: string;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***storage***:
     * storage backend used by `persist`.
     * @description
     * Defaults to `localStorage` when it is available. If no storage is available,
     * `persist` becomes a no-op and returns an empty cleanup function.
     */
    storage?: PersistStorage;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***include***:
     * state keys that should be persisted.
     * @description
     * Omit `include` to persist the whole state, except keys listed in `exclude`.
     */
    include?: (keyof S)[];
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***exclude***:
     * state keys that should never be persisted.
     */
    exclude?: (keyof S)[];
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***version***:
     * persisted schema version.
     * @description
     * Bump this number when the persisted shape changes so `migrate` can transform
     * older snapshots.
     */
    version?: number;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***migrate***:
     * transforms an older persisted snapshot into the current state shape.
     * @param persisted raw persisted state object.
     * @param from version stored in the persisted snapshot.
     * @returns partial state to hydrate into the nexus.
     */
    migrate?: (persisted: RecordAny, from: number) => Partial<S>;
    /**---
     * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
     * ### ***onError***:
     * receives storage, JSON parse or serialization errors.
     * @description
     * Errors are reported here instead of being thrown from `persist`.
     */
    onError?: (error: unknown) => void;
}
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***persist***:
 * syncs a nexus with persistent storage.
 * @description
 * Hydration is tagged with `source: "storage"`, and the write-back subscriber
 * skips updates carrying that source, so loading from disk never echoes back to
 * disk. Returns a cleanup function that stops persisting future updates.
 * @param nexus nexus instance created by `createNexus` or `createReactNexus`.
 * @param options persistence configuration.
 * @returns cleanup function that unsubscribes the persistence listener.
 * @example
 * ```ts
 * import { createNexus, persist } from "nexus-state";
 *
 * const nexus = createNexus({ state: { count: 0 } });
 *
 * const stopPersisting = persist(nexus, {
 *   key: "counter",
 *   include: ["count"],
 * });
 *
 * stopPersisting();
 * ```
 */
declare function persist<S extends RecordAny, A extends RecordAny>(nexus: Nexus<S, A>, options: PersistOptions<S>): () => void;

export { persist as default, persist };
export type { PersistOptions, PersistStorage };
