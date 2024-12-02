declare global {
  interface StatesT {
    _NEXUS_?: Partial<StatesT>;
  }
  interface ActionsT {}
}

export type UpdateFunction<T> = (currentState: T) => T;
export type ActionsCallingT = {
  stateKey?: keyof StatesT;
  payload?: any | UpdateFunction<StatesT[keyof StatesT]>;
};

export type ActionsRT = {
  [key: string]: {
    action?: (payload: any) => void; // Функция для обработки действия
    reducer?: (state: StatesT, action: { payload: any }) => StatesT; // Редуктор для обновления состояния
  };
};

export type NexusContextT = {
  get: <K extends keyof StatesT>(stateName: K) => StatesT[K];
  dispatch: ({ payload }: ActionsCallingT) => void;
  getAll: () => StatesT;
  selector: <K extends keyof StatesT>(
    selector: (state: StatesT) => StatesT[K]
  ) => StatesT[K];
  subscribe: (callback: () => void) => () => void;
  initialStates: StatesT;
};
