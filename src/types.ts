declare global {
  interface StatesT {
    _NEXUS_?: Partial<StatesT>;
  }
  interface FuncsT {}
}

export type UpdateFunc<T> = (currentState: T) => T;
export type FuncsCallT = {
  type?: keyof FuncsT extends never ? string : keyof FuncsT;
  stateKey?: keyof StatesT;
  payload?: any | UpdateFunc<StatesT[keyof StatesT]>;
};

export type FuncsAT = {
  [key: string]: {
    fData: (payload: any) => void; // Функция для обработки действия
  };
};

export type NexusContextT = {
  get: <K extends keyof StatesT>(stateName: K) => StatesT[K];
  dispatch: ({ type, payload }: FuncsCallT) => void;
  getAll: () => StatesT;
  selector: <K extends keyof StatesT>(
    selector: (state: StatesT) => StatesT[K]
  ) => StatesT[K];
  subscribe: (callback: () => void) => () => void;
  initialStates: StatesT;
};
