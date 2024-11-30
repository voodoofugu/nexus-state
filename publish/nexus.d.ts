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

type UpdateFunction<T> = (currentState: T) => T;
type ActionsCallingT = {
  type?: keyof ActionsT extends never ? string : keyof ActionsT;
  stateKey?: keyof StatesT;
  payload?: any | UpdateFunction<StatesT[keyof StatesT]>;
};

/**
 * Type describing the actions object and their reducers.
 */
type ActionsRT = {
  [key in keyof ActionsT]?: {
    /**
     * The reducer function to process the state.
     * @param state Current state.
     * @param action The action data.
     * @returns Updated state.
     */
    reducer: Exclude<
      (state: StatesT, action: ActionsCallingT) => StatesT,
      undefined
    >;
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
  actions: ActionsRT;
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

declare function nexusUpdate<K extends keyof StatesT>(updates: {
  [key in K]: StatesT[key] | ((prevState: StatesT[key]) => StatesT[key]);
}): void;

/**
 * Creates an action object.
 * @param reducer A reducer function to process the state.
 * @returns An action object with the reducer.
 * @see {@link https://www.npmjs.com/package/nexus-state Documentation}
 */
declare function nexusAction<K extends keyof StatesT>(
  stateKey: K
): {
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT;
};
declare function nexusAction(
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT
): {
  reducer: (state: StatesT, action: ActionsCallingT) => StatesT;
};

export {
  NexusProvider,
  useNexus,
  useNexusSelect,
  nexusDispatch,
  nexusUpdate,
  nexusAction,
};
