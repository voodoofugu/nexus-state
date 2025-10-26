import type { Setter, Getter, RecordAny, ActionCreate } from "./types/core";

// работа с A или Partial<A>
function createActs<S extends RecordAny, A extends RecordAny = RecordAny>(
  create: ActionCreate<A, S>
): (get: Getter<S>, set: Setter<S>) => A | Partial<A> {
  return function (this: Partial<A>, get: Getter<S>, set: Setter<S>) {
    return create.call(this, get, set);
  };
}

export default createActs;
