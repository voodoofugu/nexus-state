type SetState<T> = (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;

function createActions<T extends Record<string, any>, ThisA = {}>(
  factory: (this: ThisA, set: SetState<T>) => Partial<ThisA>
) {
  return (set: SetState<T>) => {
    const actions = {} as any;
    const created = factory.call(actions, set);
    Object.assign(actions, created);
    return actions;
  };
}

export default createActions;
