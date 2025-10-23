import type { SetState, RecordAny, Action } from "./store-core";

// работа с A или Partial<A>
function createActions<S extends RecordAny, A extends RecordAny = RecordAny>(
  create: Action<A, S>
): (setNexus: SetState<S>) => Partial<A> {
  return function (this: Partial<A>, setNexus: SetState<S>) {
    return create.call(this, setNexus);
  };
}

export default createActions;
