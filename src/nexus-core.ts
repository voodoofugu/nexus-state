import type { Setter, ActsCreateUnion, RecordAny, Nexus } from "./types/core";

type Middleware<S> = (prevState: S, nextState: S) => void | S;

function createNexus<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; acts?: ActsCreateUnion<A, S> }): Nexus<S, A> {
  const { state: initialState, acts: actionsCreator } = options;

  let state: S = { ...initialState };
  const listeners = new Map<keyof S | "*", Set<() => void>>();
  const localMiddleware: Middleware<S>[] = [];

  const notify = (keys: (keyof S)[] | "*") => {
    if (keys === "*") {
      listeners.forEach((set) => set.forEach((cb) => cb()));
    } else {
      keys.forEach((key) => listeners.get(key)?.forEach((cb) => cb()));
      listeners.get("*")?.forEach((cb) => cb());
    }
  };

  function get(): S;
  function get<K extends keyof S>(key: K): S[K];
  function get<K extends keyof S>(key?: K): S | S[K] {
    return key !== undefined ? state[key] : state;
  }

  const set: Setter<S> = (partial) => {
    const prevState = { ...state };
    const nextPartial =
      typeof partial === "function" ? partial(prevState) : partial;
    let nextState = { ...state, ...nextPartial };

    for (const middleware of localMiddleware) {
      const result = middleware(prevState, nextState);
      if (result !== undefined) nextState = result as S;
    }

    const changedKeys: (keyof S)[] = [];
    for (const key in nextState) {
      if (Object.prototype.hasOwnProperty.call(nextState, key)) {
        if (state[key] !== nextState[key]) changedKeys.push(key as keyof S);
      }
    }

    if (changedKeys.length) {
      state = nextState;
      notify(changedKeys);
    }
  };

  function reset(...keys: (keyof S)[]) {
    if (keys.length === 0) {
      state = { ...initialState };
      notify("*");
    } else {
      const nextPartial = {} as Partial<S>;
      for (const key of keys) {
        if (key in initialState) {
          nextPartial[key] = initialState[key];
        }
      }
      state = { ...state, ...nextPartial };
      notify(keys);
    }
  }

  const subscribe: Nexus<S, A>["subscribe"] = (observer, dependencies) => {
    if (dependencies.length === 0) {
      return () => {};
    }

    const wrappedObserver = () => observer(state);

    if (dependencies[0] === "*") {
      if (!listeners.has("*")) listeners.set("*", new Set());
      listeners.get("*")!.add(wrappedObserver);
      return () => listeners.get("*")?.delete(wrappedObserver);
    }

    dependencies.forEach((key) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(wrappedObserver);
    });

    return () => {
      dependencies.forEach((key) =>
        listeners.get(key)?.delete(wrappedObserver)
      );
    };
  };

  const middleware: Nexus<S, A>["middleware"] = (middleware) => {
    localMiddleware.push(middleware);
  };

  // --- собираем acts ---
  const acts = {} as A;

  if (Array.isArray(actionsCreator)) {
    for (const factory of actionsCreator) {
      const partial = factory.call(acts, get, set);
      if (partial && typeof partial === "object") Object.assign(acts, partial);
    }
  } else if (typeof actionsCreator === "function") {
    const partial = actionsCreator.call(acts, get, set);
    if (partial && typeof partial === "object") Object.assign(acts, partial);
  }

  // привязываем все функции к итоговому объекту (bind this)
  for (const key of Object.keys(acts)) {
    const val = (acts as any)[key];
    if (typeof val === "function") (acts as any)[key] = val.bind(acts);
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
