import { actions } from "./nexusConfig";

function reducer(state, action) {
  const type = action.type;
  const payload = action.payload;

  if (actions[type]) {
    const config = actions[type];

    if (config.reducer) {
      return {
        ...state,
        ...config.reducer(state, action),
      };
    } else {
      return {
        ...state,
        ...payload,
      };
    }
  }

  return state;
}

export default reducer;
