declare global {
  interface StatesT {
    _NEXUS_?: Partial<StatesT>;
  }
  interface ActionsT {}
}

export type UpdateFunction<T> = (currentState: T) => T;
export type ActionsCallingT = {
  type?: keyof ActionsT extends never ? string : keyof ActionsT;
  stateKey?: keyof StatesT;
  payload?: any | UpdateFunction<StatesT[keyof StatesT]>;
};

export type ActionFunction = (payload?: any) => void;
export type ActionReducer = (state: StatesT, payload?: any) => StatesT;
export type ActionsRT = {
  [key: string]: {
    action?: ActionFunction; // Функция для обработки действия
    reducer?: ActionReducer; // Редуктор для обновления состояния
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
