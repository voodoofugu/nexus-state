import React from "react";
import { S, A, ActionsType } from "./types";
export default function createReducer(actions: ActionsType): (state: S, action: A) => S;
declare function NexusProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
declare function useNexus<K extends keyof S>(stateName: K): S[K];
declare function useNexus(): S;
declare const useSelector: <K extends keyof S>(selector: (state: S) => S[K]) => S[K];
declare function nexusDispatch(action: A): void;
declare function createAction(reducer?: (state: S, action: A) => S): {
    reducer: ((state: S, action: A) => S) | undefined;
};
export { NexusProvider, useNexus, useSelector, nexusDispatch, createAction };
