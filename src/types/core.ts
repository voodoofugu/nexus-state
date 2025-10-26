type RecordAny = Record<string, any>;

type Setter<S> = (update: Partial<S> | ((state: S) => Partial<S>)) => void;

type Getter<S> = {
  (): S;
  <K extends keyof S>(key: K): S[K];
};

type ActionCreate<A, S> = (
  this: A | Partial<A>,
  getNexus: Getter<S>,
  setNexus: Setter<S>
) => A | Partial<A>;
type ActionCreateUnion<A, S> = ActionCreate<A, S> | Array<ActionCreate<A, S>>;

interface Store<S, A> {
  getNexus: Getter<S>;
  setNexus: Setter<S>;
  nexusReset(): void;
  nexusSubscribe(
    observer: (state: S) => void,
    dependencies: ["*"] | (keyof S)[]
  ): () => void;
  nexusGate(middleware: (state: S, nextState: S) => void | S): void;
  nexusAction: A;
}

interface ReactStore<S, A> extends Store<S, A> {
  useNexus: {
    (): S;
    <K extends keyof S>(key: K): S[K];
  };
  useNexusSelector: <R>(
    observer: (state: S) => R,
    dependencies: ["*"] | (keyof S)[]
  ) => R;
  useNexusUpdate: () => React.DispatchWithoutAction;
  nexusAction: A;
}

export type {
  RecordAny,
  Setter,
  Getter,
  ActionCreate,
  ActionCreateUnion,
  Store,
  ReactStore,
};
