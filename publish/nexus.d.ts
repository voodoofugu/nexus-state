import React from "react";

/**
 * Global interface for describing states.
 * Extend this interface in your project to define your states and functions.
 */
declare global {
  interface StatesT {
    _NEXUS_?: Partial<StatesT>;
  }
  interface FuncsT {}
}

/**
 * Type for describing functions in FuncsT.
 */
type FuncsAT = {
  [key: string]: {
    fData: (payload: any) => void;
  };
};

/**
 * Provider for the Nexus context.
 * @param initialStates Initial states object.
 * @param initialFuncs Optional object containing user-defined functions.
 * @param children React children components.
 * @see {@link https://www.npmjs.com/package/nexus-state#nexusProvider Documentation}
 */
declare const NexusProvider: React.FC<{
  initialStates: StatesT;
  initialFuncs?: FuncsAT;
  children: React.ReactNode;
}>;

/**
 * Hook for retrieving a specific state by its name.
 * @param stateName The name of the state.
 * @returns The current value of the state.
 * @see {@link https://www.npmjs.com/package/nexus-state#useNexus Documentation}
 */
declare function useNexus<K extends keyof StatesT>(stateName: K): StatesT[K];

/**
 * Hook for retrieving all states.
 * @returns An object containing all states.
 * @see {@link https://www.npmjs.com/package/nexus-state#useNexus Documentation}
 */
declare function useNexus(): StatesT;

/**
 * Hook for selecting specific data from the state.
 * @param selector A selector function to extract data from the state.
 * @returns The result of the selector function.
 * @see {@link https://www.npmjs.com/package/nexus-state#useNexusSelect Documentation}
 */
declare const useNexusSelect: <K extends keyof StatesT>(
  selector: (state: StatesT) => StatesT[K]
) => StatesT[K];

type MappedActions = {
  [K in keyof FuncsT]: FuncsT[K] extends {
    fData: (payload: infer P) => void;
  }
    ? {
        type: K;
        payload: P;
      }
    : FuncsT[K] extends {
        reducer: (
          state: StatesT,
          fData: {
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
/**
 * Function for calling user-defined functions
 * @param fData An object containing the `type` and `payload` of the effect.
 * @see {@link https://www.npmjs.com/package/nexus-state#nexusEffect Documentation}
 */
declare function nexusEffect(fData: DispatchAction): void;

/**
 * Function for updating states.
 * @param updates An object where keys are state names and values are either new state values or update functions.
 * @see {@link https://www.npmjs.com/package/nexus-state#nexusUpdate Documentation}
 */
declare function nexusUpdate<K extends keyof StatesT>(updates: {
  [key in K]: StatesT[key] | ((prevState: StatesT[key]) => StatesT[key]);
}): void;

export { NexusProvider, useNexus, useNexusSelect, nexusEffect, nexusUpdate };
