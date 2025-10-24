type RecordAny = Record<string, any>;

type Middleware<S> = (prevState: S, nextState: S) => void | S;

// Тип функции для обновления состояния
type SetState<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;

type Action<A, S> = (
  this: A | Partial<A>,
  setNexus: SetState<S>
) => A | Partial<A>;

type ActionCreate<A, S> = Action<A, S> | Array<Action<A, S>>;

type Store<S> = {
  getNexus(): S;
  getNexus<K extends keyof S>(key: K): S[K];
  setNexus: SetState<S>;
  nexusReset(): void;
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;
  nexusGate(middleware: Middleware<S>): void;
};

function createStore<
  S extends RecordAny = RecordAny,
  A extends RecordAny = RecordAny
>(options: {
  state: S;
  actions?: ActionCreate<A, S>;
}): { store: Store<S>; actions: A } {
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

  const setNexus: SetState<S> = (partial) => {
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

  const nexusSubscribe: Store<S>["nexusSubscribe"] = (
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

  const nexusGate: Store<S>["nexusGate"] = (middleware) => {
    localMiddleware.push(middleware);
  };

  const store: Store<S> = {
    getNexus,
    setNexus,
    nexusReset,
    nexusSubscribe,
    nexusGate,
  };

  // --- собираем actions ---
  const actions = {} as A;

  if (Array.isArray(actionsCreator)) {
    for (const factory of actionsCreator) {
      const partial = factory.call(actions, setNexus);
      if (partial && typeof partial === "object")
        Object.assign(actions, partial);
    }
  } else if (typeof actionsCreator === "function") {
    const partial = actionsCreator.call(actions, setNexus);
    if (partial && typeof partial === "object") Object.assign(actions, partial);
  }

  // привязываем все функции к итоговому объекту (bind this)
  for (const key of Object.keys(actions)) {
    const val = (actions as any)[key];
    if (typeof val === "function") (actions as any)[key] = val.bind(actions);
  }

  return { store, actions };
}

export default createStore;
export type { SetState, Store, Action, ActionCreate, RecordAny };
