import createStore from "../store-core";
import createReactStore from "../store-react";

// createStore
type Middleware<T> = (prevState: T, nextState: T) => T | void;
type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
interface Store<T> {
  getNexus(): T;
  setNexus: SetState<T>;
  nexusReset(): void;
  nexusSubscribe(keys: (keyof T)[] | "*", listener: () => void): () => void;
  nexusGate(fn: Middleware<T>): void;
}
declare function createStore<
  T extends Record<string, unknown>,
  A extends object = object
>(options: {
  state: T;
  actions?: (set: SetState<T>) => A;
}): {
  state: Store<T>;
  actions: A;
};

// createReactStore
interface CreateReactStoreOptions<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: unknown[]) => unknown>
> {
  state: T;
  actions?: (
    set: (updater: Partial<T> | ((prev: T) => Partial<T>)) => void
  ) => A;
}
declare function createReactStore<
  T extends Record<string, unknown>,
  A extends Record<string, (...args: any[]) => unknown> = Record<
    string,
    (...args: unknown[]) => unknown
  >
>(
  options: CreateReactStoreOptions<T, A>
): {
  state: {
    useNexus: {
      (): T;
      <K extends keyof T>(key: K): T[K];
    };
    useNexusSelector: <R>(
      selector: (state: T) => R,
      dependencies: (keyof T)[]
    ) => R;
    getNexus(): T;
    setNexus: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
    nexusReset(): void;
    nexusSubscribe(keys: "*" | (keyof T)[], listener: () => void): () => void;
    nexusGate(fn: (prevState: T, nextState: T) => void | T): void;
  };
  actions: A;
};

export { createStore, createReactStore };
