import type { SetState } from "./store-core";

// работа с частью A (Partial<A>)
function createActions<
  S extends Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(
  factory: (this: Partial<A>, setNexus: SetState<S>) => Partial<A>
): (setNexus: SetState<S>) => Partial<A> {
  return function (this: Partial<A>, setNexus: SetState<S>) {
    return factory.call(this, setNexus);
  };
}

export default createActions;
