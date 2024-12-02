import React from "react";

/**
 * Global interface for describing states.
 * Extend this interface in your project to define your states.
 */
declare global {
  interface StatesT {
    _NEXUS_?: Partial<StatesT>;
  }
  interface ActionsT {}
}

type ActionsRT = {
  [key: string]: {
    action?: (payload: any) => void;
    reducer?: (
      state: StatesT,
      action: {
        payload: any;
      }
    ) => StatesT;
  };
};

/**
 * Provider for the Nexus context.
 * @param initialStates Initial states object.
 * @param actions Object containing actions and their reducers.
 * @param children React children components.
 */
declare const NexusProvider: React.FC<{
  initialStates: StatesT;
  actions?: ActionsRT;
  children: React.ReactNode;
}>;

/**
 * Hook for retrieving a specific state by its name.
 * @param stateName The name of the state.
 * @returns The current value of the state.
 * @see {@link https://www.npmjs.com/package/nexus-state Documentation}
 */
declare function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];

/**
 * Hook for retrieving all states.
 * @returns An object containing all states.
 * @see {@link https://www.npmjs.com/package/nexus-state Documentation}
 */
declare function useNexus(): StatesT;

/**
 * Hook for selecting specific data from the state.
 * @param selector A selector function to extract data from the state.
 * @returns The result of the selector function.
 * @see {@link https://www.npmjs.com/package/nexus-state Documentation}
 */
declare const useNexusSelect: <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
) => StatesT[K];

/**
 * Function for dispatching actions.
 * @param action A single action or an array of actions to process.
 * @see {@link https://www.npmjs.com/package/nexus-state Documentation}
 */
type MappedActions = {
  [K in keyof ActionsT]: ActionsT[K] extends {
    action: (payload: infer P) => void;
  }
    ? {
        type: K;
        payload: P;
      }
    : ActionsT[K] extends {
        reducer: (
          state: StatesT,
          action: {
            payload: infer P;
          }
        ) => StatesT;
      }
    ? {
        type: K;
        payload: P;
      }
    : never;
};
type DispatchAction = MappedActions[keyof MappedActions];
declare function nexusDispatch(action: DispatchAction): void;

declare function nexusUpdate<K extends keyof StatesT>(updates: {
  [key in K]: StatesT[key] | ((prevState: StatesT[key]) => StatesT[key]);
}): void;

export { NexusProvider, useNexus, useNexusSelect, nexusDispatch, nexusUpdate };
