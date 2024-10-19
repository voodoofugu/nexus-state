import React from "react";
type Action = {
    type: string;
    payload?: object;
};
export default function context<Context>(initialStates: Context, reducer: (state: Context, action: Action) => Context): {
    useGetNexus: {
        (stateName: string): object;
        <SelectorOutput>(stateName: string): SelectorOutput | undefined;
    };
    useSetNexus: () => (value: Partial<Context> | Action) => void;
    useNexusAll: () => Context;
    NexusContextProvider: ({ children, }: Readonly<{
        children: React.ReactNode;
    }>) => React.JSX.Element;
};
export {};
