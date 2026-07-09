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

/**
 * Type-preserving deep copy for the initial snapshot, so state never shares
 * nested references with the caller's object or with `reset`'s pristine copy.
 * Falls back to a shallow copy on engines without `structuredClone`, or for
 * non-cloneable values (functions, DOM nodes, …).
 */
function snapshot<T>(value: T): T {
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
  } catch {
    /* non-cloneable — fall back to a shallow copy */
  }
  if (Array.isArray(value)) return value.slice() as unknown as T;
  if (value && typeof value === "object") return { ...value };
  return value;
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

  // Independent deep copies: the pristine snapshot for `reset`, and the live
  // state — neither shares nested references with the caller's object.
  const frozenInitial = snapshot(initialState);
  let state: S = snapshot(initialState);

  const listeners = new Map<keyof S | "*", Set<Observer<S>>>();
  const localMiddleware: Middleware<S>[] = [];

  // --- internal action batching ---
  let batchDepth = 0;
  const pendingKeys = new Set<keyof S>();
  let pendingContext: UpdateContext | undefined;
  // Name of the entry-point action currently running — used to auto-tag the
  // `source` of updates made inside an action when no explicit context is given.
  let currentActionName: string | undefined;

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
    // An explicit `set` context wins; otherwise fall back to the action name, so
    // an action's updates are labelled by the action in subscribers / devtools.
    const context =
      pendingContext ??
      (currentActionName ? { source: currentActionName } : undefined);
    pendingKeys.clear();
    pendingContext = undefined;
    notify(keys, context);
  }

  // Runs an action inside a batch and records its name so nested `set` calls can
  // inherit it as their `source`. Only the outermost (entry-point) action names
  // the batch; nested `this.other()` calls don't override it.
  function runInAction<T>(name: string, fn: () => T): T {
    if (batchDepth === 0) currentActionName = name;
    batchDepth++;
    try {
      return fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0) {
        flushBatch();
        currentActionName = undefined;
      }
    }
  }

  function reset(...keys: (keyof S)[]) {
    // Route resets through `set` so middleware and subscribers observe them
    // with a `"reset"` source instead of being bypassed.
    // Clone from the pristine snapshot each time, so the restored values don't
    // share references with `frozenInitial` (a later in-place mutation of the
    // reset state can't corrupt future resets).
    if (keys.length === 0) {
      set(snapshot(frozenInitial) as Partial<S>, "reset");
      return;
    }

    const nextPartial = {} as Partial<S>;
    for (const key of keys) {
      if (key in frozenInitial) nextPartial[key] = snapshot(frozenInitial[key]);
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
  // so the synchronous `set` calls it makes notify subscribers once (and inherit
  // the action name as their `source`). Calls made after an `await` run as
  // separate updates (the batch already flushed).
  for (const key of Object.keys(acts)) {
    const val = (acts as RecordAny)[key];
    if (typeof val === "function") {
      (acts as RecordAny)[key] = (...args: unknown[]) =>
        runInAction(key, () => val.apply(acts, args));
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
