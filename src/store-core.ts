type Middleware<T> = (prevState: T, nextState: T) => T | void;

type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

interface Store<T> {
  getNexus(): T;
  setNexus: SetState<T>;
  nexusReset(): void;
  nexusSubscribe(keys: (keyof T)[] | "*", listener: () => void): () => void;
  nexusGate(fn: Middleware<T>): void;
}

function createStore<
  T extends Record<string, unknown>,
  A extends object = object
>(options: {
  state: T;
  actions?: (set: SetState<T>) => A;
}): { state: Store<T>; actions: A } {
  const { state: initialState, actions: actionsCreator } = options;

  let state: T = { ...initialState };
  const listeners = new Map<keyof T | "*", Set<() => void>>();
  const middlewares: Middleware<T>[] = [];

  const notify = (keys: (keyof T)[] | "*") => {
    if (keys === "*") {
      listeners.forEach((set) => set.forEach((cb) => cb()));
      return;
    }
    keys.forEach((key) => listeners.get(key)?.forEach((cb) => cb()));
    listeners.get("*")?.forEach((cb) => cb());
  };

  const getNexus = () => state;

  const setNexus: SetState<T> = (partial) => {
    const prevState = { ...state };
    const nextPartial =
      typeof partial === "function" ? partial(prevState) : partial;
    let nextState = { ...state, ...nextPartial };

    middlewares.forEach((fn) => {
      const result = fn(prevState, nextState);
      if (result !== undefined) nextState = result;
    });

    const changedKeys: (keyof T)[] = [];
    for (const key in nextState) {
      if (state[key] !== nextState[key]) changedKeys.push(key);
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

  const nexusSubscribe: Store<T>["nexusSubscribe"] = (keys, listener) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach((key) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(listener);
    });
    return () => {
      keysArray.forEach((key) => listeners.get(key)?.delete(listener));
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

  const actions = actionsCreator ? actionsCreator(setNexus) : ({} as A);

  return { state: store, actions };
}

export type { Store };
export default createStore;
