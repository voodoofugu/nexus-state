import type {
  Setter,
  Getter,
  SetContext,
  UpdateContext,
  RecordAny,
  Nexus,
  NexusOptions,
  Middleware,
  Observer,
  Dependencies,
  ActsCreate,
  ActsPart,
} from "./types/core";

/** Normalize the `set` context: a bare string becomes `{ source }`. */
function normalizeContext(context?: SetContext): UpdateContext | undefined {
  if (context === undefined) return undefined;
  return typeof context === "string" ? { source: context } : context;
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createNexus***:
 * creates a framework-agnostic nexus store.
 * @description
 * `createNexus` owns state, actions, middleware and key-level subscriptions
 * without depending on React. State and actions are inferred from the config.
 * @param options initial state and optional action creator, action slice or action slices.
 * @returns a `Nexus` instance with `get`, `set`, `reset`, `subscribe`,
 * `middleware` and `acts`.
 * @example
 * ```ts
 * import { createNexus } from "nexus-state";
 *
 * const nexus = createNexus({
 *   state: { count: 0 },
 *   acts: (get, set) => ({
 *     increment() {
 *       set({ count: get("count") + 1 }, "manual");
 *     },
 *   }),
 * });
 *
 * nexus.acts.increment();
 * nexus.get("count"); // number
 * ```
 */
function createNexus<S extends RecordAny, A extends RecordAny>(options: {
  state: S;
  acts: ActsCreate<S, A>;
}): Nexus<S, A>;
function createNexus<S extends RecordAny, A extends RecordAny>(options: {
  state: S;
  acts: ActsPart<S, A> | ActsPart<S, A>[];
}): Nexus<S, A>;
function createNexus<S extends RecordAny>(options: {
  state: S;
}): Nexus<S, Record<string, never>>;
function createNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = Record<string, never>
>(options: NexusOptions<S, A>): Nexus<S, A>;
function createNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = Record<string, never>
>(options: NexusOptions<S, A>): Nexus<S, A> {
  const { state: initialState, acts: actionsCreator } = options;

  const frozenInitial = { ...initialState };
  let state: S = { ...initialState };

  const listeners = new Map<keyof S | "*", Set<Observer<S>>>();
  const localMiddleware: Middleware<S>[] = [];

  // --- internal action batching ---
  let batchDepth = 0;
  const pendingKeys = new Set<keyof S>();
  let pendingContext: UpdateContext | undefined;

  const notify = (keys: (keyof S)[] | "*", context?: UpdateContext) => {
    // Collect callbacks first so an observer subscribed under several keys
    // is invoked exactly once per update, not once per matching key.
    const callbacks = new Set<Observer<S>>();

    if (keys === "*") {
      listeners.forEach((set) => set.forEach((cb) => callbacks.add(cb)));
    } else {
      keys.forEach((key) =>
        listeners.get(key)?.forEach((cb) => callbacks.add(cb))
      );
      listeners.get("*")?.forEach((cb) => callbacks.add(cb));
    }

    callbacks.forEach((cb) => cb(state, context));
  };

  function get(): S;
  function get<K extends keyof S>(key: K): S[K];
  function get<K extends keyof S>(key?: K): S | S[K] {
    return key !== undefined ? state[key] : state;
  }

  // Batching: one `set` with several keys notifies subscribers once — that is
  // the primary way to batch. Actions add automatic batching on top (see the
  // acts wrapper below) for the synchronous `set` calls made inside them.
  const set: Setter<S> = (update, context) => {
    const prevState = state;
    const normalizedContext = normalizeContext(context);

    const nextPartial =
      typeof update === "function" ? update(prevState) : update;

    let nextState = { ...state, ...nextPartial };

    // --- run through middleware (may replace the next state) ---
    for (const middleware of localMiddleware) {
      const result = middleware(prevState, nextState, normalizedContext);
      if (result !== undefined) nextState = result as S;
    }

    // --- compute changed keys ---
    const changedKeys: (keyof S)[] = [];
    for (const key in nextState) {
      if (Object.prototype.hasOwnProperty.call(nextState, key)) {
        if (prevState[key] !== nextState[key]) changedKeys.push(key as keyof S);
      }
    }

    if (!changedKeys.length) return;

    state = nextState;

    if (batchDepth > 0) {
      changedKeys.forEach((key) => pendingKeys.add(key));
      if (normalizedContext) pendingContext = normalizedContext;
      return;
    }

    notify(changedKeys, normalizedContext);
  };

  function flushBatch() {
    if (batchDepth !== 0 || !pendingKeys.size) return;

    const keys: (keyof S)[] = [];
    pendingKeys.forEach((key) => keys.push(key));
    const context = pendingContext;
    pendingKeys.clear();
    pendingContext = undefined;
    notify(keys, context);
  }

  function runInBatch<T>(fn: () => T): T {
    batchDepth++;
    try {
      return fn();
    } finally {
      batchDepth--;
      flushBatch();
    }
  }

  function reset(...keys: (keyof S)[]) {
    // Route resets through `set` so middleware and subscribers observe them
    // with a `"reset"` source instead of being bypassed.
    if (keys.length === 0) {
      set(frozenInitial as Partial<S>, "reset");
      return;
    }

    const nextPartial = {} as Partial<S>;
    for (const key of keys) {
      if (key in frozenInitial) nextPartial[key] = frozenInitial[key];
    }
    set(nextPartial, "reset");
  }

  const subscribe: Nexus<S, A>["subscribe"] = (
    observer,
    dependencies = ["*"] as Dependencies<S>
  ) => {
    if (dependencies.length === 0) return () => {};

    if (dependencies[0] === "*") {
      if (!listeners.has("*")) listeners.set("*", new Set());
      listeners.get("*")!.add(observer);
      return () => {
        listeners.get("*")?.delete(observer);
      };
    }

    dependencies.forEach((key) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(observer);
    });

    return () => {
      dependencies.forEach((key) => listeners.get(key)?.delete(observer));
    };
  };

  const middleware: Nexus<S, A>["middleware"] = (fn) => {
    localMiddleware.push(fn);
    return () => {
      const index = localMiddleware.indexOf(fn);
      if (index !== -1) localMiddleware.splice(index, 1);
    };
  };

  // --- assemble acts ---
  const acts = {} as A;

  const runFactory = (
    factory: (this: A, get: Getter<S>, set: Setter<S>) => unknown
  ) => {
    const partial = factory.call(acts, get, set);
    if (partial && typeof partial === "object") Object.assign(acts, partial);
  };

  if (Array.isArray(actionsCreator)) {
    actionsCreator.forEach((factory) => runFactory(factory));
  } else if (typeof actionsCreator === "function") {
    runFactory(actionsCreator);
  }

  // Bind every action to the final acts object so cross-action `this` calls
  // work even when actions are destructured. Each action is internally batched,
  // so the synchronous `set` calls it makes notify subscribers once. Calls made
  // after an `await` run as separate updates (the batch already flushed).
  for (const key of Object.keys(acts)) {
    const val = (acts as RecordAny)[key];
    if (typeof val === "function") {
      (acts as RecordAny)[key] = (...args: unknown[]) =>
        runInBatch(() => val.apply(acts, args));
    }
  }

  return {
    get,
    set,
    reset,
    subscribe,
    middleware,
    acts,
  };
}

export default createNexus;
