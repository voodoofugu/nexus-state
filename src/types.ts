declare global {
  interface StatesT {}
  interface ActionsT {}
}

export type UpdateFunction<T> = (currentState: T) => T;
export type ActionsCallingT = {
  type?: keyof ActionsT extends never ? string : keyof ActionsT;
  stateKey?: keyof StatesT;
  payload?: any | UpdateFunction<StatesT[keyof StatesT]>;
};

export type ActionsRT = {
  [key in keyof ActionsT]?: {
    reducer: Exclude<
      (state: StatesT, action: ActionsCallingT) => StatesT,
      undefined
    >;
  };
};

export type NexusContextT = {
  get: <K extends keyof StatesT>(stateName: K) => StatesT[K];
  dispatch: ({ type, payload }: ActionsCallingT) => void;
  getAll: () => StatesT;
  selector: <K extends keyof StatesT>(
    selector: (state: StatesT) => StatesT[K]
  ) => StatesT[K];
  subscribe: (callback: () => void) => () => void;
  initialStates: StatesT;
};
