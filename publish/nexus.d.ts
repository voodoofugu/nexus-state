import React from "react";
declare global {
  interface StatesT {}
  interface ActionsT {}
}
export type ActionsCallingT = {
  type: keyof ActionsT extends never ? string : keyof ActionsT;
  payload?: any;
};
export type ActionsRT = {
  [key in keyof ActionsT]: {
    reducer: (state: StatesT, action: ActionsCallingT) => StatesT;
  };
} & Record<string, never>;
declare const NexusProvider: React.FC<{
  initialStates: StatesT;
  actions: ActionsRT;
  children: React.ReactNode;
}>;
declare function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];
declare function useNexus(): StatesT;
declare const useSelector: <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
) => StatesT[K];
declare function nexusDispatch(action: ActionsCallingT): void;
declare function createAction(
  reducer?: (state: StatesT, action: ActionsCallingT) => StatesT
): {
  reducer: ((state: StatesT, action: ActionsCallingT) => StatesT) | undefined;
};
export declare const Nexus: {
  NexusProvider: import("react").FC<{
    initialStates: StatesT;
    actions: import("./types").ActionsRT;
    children: React.ReactNode;
  }>;
  useNexus: typeof useNexus;
  useSelector: <K extends keyof StatesT>(
    selector: (state: StatesT) => StatesT[K]
  ) => StatesT[K];
  nexusDispatch: typeof nexusDispatch;
  createAction: typeof createAction;
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

export { NexusProvider, useNexus, useSelector, nexusDispatch, createAction };
