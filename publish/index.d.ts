import React from "react";
interface Config {
  initialStates: Record<string, any>;
  actions: Record<
    string,
    {
      reducer?: (state: any, action: any) => any;
    }
  >;
}
interface ProviderProps {
  initialStates: Config["initialStates"];
  actions: Config["actions"];
  children: React.ReactNode;
}
declare const useGetNexus: (stateName: string) => object;
declare const useSetNexus: () => (
  value:
    | {
        type: string;
        payload?: object;
      }
    | Partial<unknown>
) => void;
declare const useNexusAll: () => unknown;
declare const NexusProvider: React.FC<ProviderProps>;

export { useGetNexus, useSetNexus, useNexusAll, NexusProvider };
