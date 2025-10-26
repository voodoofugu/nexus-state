import type { Setter, Getter, RecordAny, ActionCreate } from "./types/core";

// работа с A или Partial<A>
function createActions<S extends RecordAny, A extends RecordAny = RecordAny>(
  create: ActionCreate<A, S>
): (getNexus: Getter<S>, setNexus: Setter<S>) => A | Partial<A> {
  return function (this: Partial<A>, getNexus: Getter<S>, setNexus: Setter<S>) {
    return create.call(this, getNexus, setNexus);
  };
}

export default createActions;
