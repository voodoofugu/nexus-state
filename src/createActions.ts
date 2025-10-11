// createActions.ts
export type SetState<T> = (
  partial: Partial<T> | ((prev: T) => Partial<T>)
) => void;

/** Монолитная фабрика — возвращает полный набор действий A */
export function createActions<
  S extends Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(factory: (this: A, set: SetState<S>) => A): (set: SetState<S>) => A {
  return function (this: A, set: SetState<S>) {
    return factory.call(this, set);
  };
}

/** Дискретная фабрика — возвращает только часть A (Partial<A>) */
export function createDiscreteActions<
  S extends Record<string, any>,
  A extends Record<string, any> = Record<string, any>
>(
  factory: (this: Partial<A>, set: SetState<S>) => Partial<A>
): (set: SetState<S>) => Partial<A> {
  return function (this: Partial<A>, set: SetState<S>) {
    return factory.call(this, set);
  };
}
