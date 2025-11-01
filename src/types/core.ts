type RecordAny = Record<string, any>;

type Source = "manual" | "storage" | "server" | "external";
type MiddlewareSource = { source: string; meta?: Record<string, any> };

type Setter<S> = {
  (
    update: Partial<S> | ((state: S) => Partial<S>),
    context?: MiddlewareSource
  ): void;
  (update: Partial<S> | ((state: S) => Partial<S>), source?: Source): void;
  (update: Partial<S> | ((state: S) => Partial<S>), source?: string): void;
};

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

type Middleware<S> = (
  prevState: S,
  nextState: S,
  context?: MiddlewareSource
) => void | S;

interface Nexus<S, A> {
  get: Getter<S>;
  set: Setter<S>;
  reset(...keys: (keyof S)[]): void;
  subscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;
  middleware(middleware: Middleware<S>): void;
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
  Middleware,
};
