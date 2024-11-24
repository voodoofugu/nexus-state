import React from "react";
declare global {
  interface StatesT {}
  interface ActionsT {}
}
type ActionsCallingT = {
  type?: keyof ActionsT extends never ? string : keyof ActionsT;
  payload?: any;
};
type ActionsRT = {
  [key in keyof ActionsT]?: {
    reducer: Exclude<
      (state: StatesT, action: ActionsCallingT) => StatesT,
      undefined
    >;
  };
};
declare const NexusProvider: React.FC<{
  initialStates: StatesT;
  actions: ActionsRT;
  children: React.ReactNode;
}>;
declare function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];
declare function useNexus(): StatesT;
declare const useNexusSelect: <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
) => StatesT[K];
declare function nexusDispatch(
  action:
    | {
        type: keyof ActionsT;
        payload?: any;
      }
    | {
        type: keyof ActionsT;
        payload?: any;
      }[]
): void;
declare function nexusAction(
  reducer?: (state: StatesT, action: ActionsCallingT) => StatesT
): {
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT;
};
export { NexusProvider, useNexus, useNexusSelect, nexusDispatch, nexusAction };
