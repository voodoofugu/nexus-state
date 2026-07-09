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

interface DevtoolsOptions {
    /** Instance name shown in the Redux DevTools dropdown. */
    name?: string;
    /**
     * Set `false` to disable (e.g. in production). Defaults to `true`; the adapter
     * is still a no-op when the extension is not installed.
     */
    enabled?: boolean;
}
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***devtools***:
 * connects a nexus to the Redux DevTools browser extension.
 * @description
 * Every update is sent to Redux DevTools as an action whose **type is the update
 * `source`** (`"server"`, `"storage"`, `"reset"`, or your own) — so the timeline
 * shows *where each change came from*, not just that it happened. Time-travel
 * (jump / reset / rollback) writes the selected state back with a private source
 * that the sender skips, so there is no echo loop.
 *
 * A no-op when the extension is not installed or `enabled` is `false`, so it is
 * safe to leave in place. Returns a cleanup function that disconnects.
 * @param nexus nexus instance created by `createNexus` or `createReactNexus`.
 * @param options devtools configuration.
 * @returns cleanup function that stops sending and disconnects.
 * @example
 * ```ts
 * import { createNexus } from "nexus-state";
 * import { devtools } from "nexus-state/devtools";
 *
 * const nexus = createNexus({ state: { count: 0 } });
 * const stop = devtools(nexus, { name: "Counter" });
 *
 * nexus.set({ count: 1 }, "user"); // appears in DevTools as action "user"
 * stop();
 * ```
 */
declare function devtools<S extends RecordAny, A extends RecordAny>(nexus: Nexus<S, A>, options?: DevtoolsOptions): () => void;

export { devtools as default, devtools };
export type { DevtoolsOptions };
