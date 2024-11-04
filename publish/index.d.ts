import { NexusProvider, useNexus, useSelector, nexusDispatch, createAction } from "./nexus";
export declare const Nexus: {
    NexusProvider: typeof NexusProvider;
    useNexus: typeof useNexus;
    useSelector: <K extends keyof import("./types").S>(selector: (state: import("./types").S) => import("./types").S[K]) => import("./types").S[K];
    nexusDispatch: typeof nexusDispatch;
    createAction: typeof createAction;
};
export { NexusProvider, useNexus, useSelector, nexusDispatch, createAction };
