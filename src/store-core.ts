import type { Setter, ActionCreateUnion, RecordAny, Store } from "./types/core";

type Middleware<S> = (prevState: S, nextState: S) => void | S;

function createStore<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: { state: S; actions?: ActionCreateUnion<A, S> }): Store<S, A> {
  const { state: initialState, actions: actionsCreator } = options;

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

  function getNexus(): S;
  function getNexus<K extends keyof S>(key: K): S[K];
  function getNexus<K extends keyof S>(key?: K): S | S[K] {
    return key !== undefined ? state[key] : state;
  }

  const setNexus: Setter<S> = (partial) => {
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

  const nexusReset = () => {
    state = { ...initialState };
    notify("*");
  };

  const nexusSubscribe: Store<S, A>["nexusSubscribe"] = (
    observer,
    dependencies
  ) => {
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

  const nexusGate: Store<S, A>["nexusGate"] = (middleware) => {
    localMiddleware.push(middleware);
  };

  // --- собираем actions ---
  const nexusAction = {} as A;

  if (Array.isArray(actionsCreator)) {
    for (const factory of actionsCreator) {
      const partial = factory.call(nexusAction, getNexus, setNexus);
      if (partial && typeof partial === "object")
        Object.assign(nexusAction, partial);
    }
  } else if (typeof actionsCreator === "function") {
    const partial = actionsCreator.call(nexusAction, getNexus, setNexus);
    if (partial && typeof partial === "object")
      Object.assign(nexusAction, partial);
  }

  // привязываем все функции к итоговому объекту (bind this)
  for (const key of Object.keys(nexusAction)) {
    const val = (nexusAction as any)[key];
    if (typeof val === "function")
      (nexusAction as any)[key] = val.bind(nexusAction);
  }

  return {
    getNexus,
    setNexus,
    nexusReset,
    nexusSubscribe,
    nexusGate,
    nexusAction,
  };
}

export default createStore;
