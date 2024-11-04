import React from "react";
import { initialStates, actions } from "../../nexusConfig";

export type S = typeof initialStates;
type ActionKey = keyof typeof actions;

export type A<T = any> = {
  type: ActionKey;
  payload?: T;
};

export type ActionsType = {
  [key in ActionKey]: {
    reducer?: (state: S, action: A) => S;
  };
};

export type NexusContextType = {
  get: <K extends keyof S>(stateName: K) => S[K];
  dispatch: ({ type, payload }: A) => void;
  getAll: () => S;
  selector: <K extends keyof S>(selector: (state: S) => S[K]) => S[K];
  subscribe: (callback: () => void) => () => void;
};
