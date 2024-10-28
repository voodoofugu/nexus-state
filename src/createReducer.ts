import { Config, S } from "./nexusStore";

export default function createReducer(actions: Config["actions"]) {
  return function reducerNexus(
    state: S,
    action: { type: string; payload?: Partial<S> }
  ): S {
    const type = action.type as keyof typeof actions;
    const payload = action.payload;

    if (actions[type]) {
      const config = actions[type];

      if (config.reducer) {
        return config.reducer(state, action);
      } else {
        return {
          ...state,
          ...payload,
        } as S;
      }
    }

    return state;
  };
}
