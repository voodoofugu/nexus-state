import React from "react";

export type ActionType = {
  type: string;
  payload?: any;
};

export default function context<Context extends Record<string, unknown>>(
  initialStates: Context,
  reducer: (state: Context, action: ActionType) => Context
): {
  useGetNexus: <K extends keyof Context>(stateName: K) => Context[K];
  useSetNexus: () => (value: Partial<Context> | ActionType) => void;
  useNexusAll: () => Context;
  NexusContextProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => React.ReactElement;
};

type ActionTypeLocal<StatesType = Record<string, unknown>> = {
  reducer?: (state: StatesType, action: ActionType) => StatesType;
};

type ActionsMap<StatesType = Record<string, unknown>> = {
  [actionKey: string]: ActionTypeLocal<StatesType>;
};

type Config<StatesType = Record<string, unknown>> = {
  initialStates: StatesType;
  actions: ActionsMap<StatesType>;
};

type ProviderProps<StatesType> = {
  initialStates: StatesType;
  actions: Config<StatesType>["actions"];
  watch?: boolean;
  children: React.ReactNode;
};

declare const useGetNexus: <K extends keyof ReturnType<typeof useNexusAll>>(
  stateName: K
) => ReturnType<typeof useNexusAll>[K];
declare const useSetNexus: () => (value: Partial<any> | ActionType) => void;
declare const useNexusAll: () => any;

declare const NexusProvider: <StatesType extends Record<string, unknown>>({
  initialStates,
  actions,
  children,
}: ProviderProps<StatesType>) => React.ReactElement;

export declare const Nexus: {
  useGetNexus: typeof useGetNexus;
  useSetNexus: typeof useSetNexus;
  useNexusAll: typeof useNexusAll;
  NexusProvider: typeof NexusProvider;
};

export { useGetNexus, useSetNexus, useNexusAll, NexusProvider };
