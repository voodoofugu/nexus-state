// store-core.ts
type Middleware<T> = (prevState: T, nextState: T) => T | void;
export type SetState<T> = (
  partial: Partial<T> | ((prev: T) => Partial<T>)
) => void;

export interface Store<T> {
  getNexus(): T;
  getNexus<K extends keyof T>(key: K): T[K];
  setNexus: SetState<T>;
  nexusReset(): void;
  nexusSubscribe(
    observer: (state: T) => void,
    dependencies: (keyof T)[]
  ): () => void;
  nexusGate(fn: Middleware<T>): void;
}

function createStore<
  T extends Record<string, any> = Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(options: {
  state: T;
  actions?:
    | ((this: A, set: SetState<T>) => A)
    | Array<(this: Partial<A>, set: SetState<T>) => Partial<A>>;
}): { state: Store<T>; actions: A } {
  const { state: initialState, actions: actionsCreator } = options;

  let state: T = { ...initialState };
  const listeners = new Map<keyof T | "*", Set<() => void>>();
  const middlewares: Middleware<T>[] = [];

  const notify = (keys: (keyof T)[] | "*") => {
    if (keys === "*") {
      listeners.forEach((set) => set.forEach((cb) => cb()));
    } else {
      keys.forEach((key) => listeners.get(key)?.forEach((cb) => cb()));
      listeners.get("*")?.forEach((cb) => cb());
    }
  };

  function getNexus(): T;
  function getNexus<K extends keyof T>(key: K): T[K];
  function getNexus<K extends keyof T>(key?: K): T | T[K] {
    return key !== undefined ? state[key] : state;
  }

  const setNexus: SetState<T> = (partial) => {
    const prevState = { ...state };
    const nextPartial =
      typeof partial === "function" ? partial(prevState) : partial;
    let nextState = { ...state, ...nextPartial };

    for (const fn of middlewares) {
      const result = fn(prevState, nextState);
      if (result !== undefined) nextState = result as T;
    }

    const changedKeys: (keyof T)[] = [];
    for (const key in nextState) {
      if (Object.prototype.hasOwnProperty.call(nextState, key)) {
        if (state[key] !== nextState[key]) changedKeys.push(key as keyof T);
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

  const nexusSubscribe: Store<T>["nexusSubscribe"] = (
    observer,
    dependencies
  ) => {
    const wrappedObserver = () => observer(state);

    if (dependencies.length === 0) {
      // подписка на всё
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

  const nexusGate: Store<T>["nexusGate"] = (fn) => {
    middlewares.push(fn);
  };

  const store: Store<T> = {
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

  // привязываем все функции к итоговому объекту
  for (const key of Object.keys(actions)) {
    const val = (actions as any)[key];
    if (typeof val === "function") (actions as any)[key] = val.bind(actions);
  }

  return { state: store, actions };
}

export default createStore;
