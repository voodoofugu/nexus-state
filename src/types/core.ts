type RecordAny = Record<string, any>;

type Setter<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;

type Getter<S> = {
  (): S;
  <K extends keyof S>(key: K): S[K];
};

type ActsCreate<A, S> = (
  this: A | Partial<A>,
  get: Getter<S>,
  set: Setter<S>
) => A | Partial<A>;
type ActsCreateUnion<A, S> = ActsCreate<A, S> | Array<ActsCreate<A, S>>;

interface Nexus<S, A> {
  get: Getter<S>;
  set: Setter<S>;
  reset(...keys: (keyof S)[]): void;
  subscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;
  middleware(middleware: (prev: S, next: S) => void | S): void;
  acts: A;
}

interface ReactNexus<S, A> extends Nexus<S, A> {
  use: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };
  useSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;
  useRerender: () => React.DispatchWithoutAction;
  acts: A;
}

export type {
  RecordAny,
  Setter,
  Getter,
  ActsCreate,
  ActsCreateUnion,
  Nexus,
  ReactNexus,
};
