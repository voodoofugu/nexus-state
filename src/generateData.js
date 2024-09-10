const configPath = process.env.NEXUS_CONFIG_PATH || "./nexusConfig";
let nexusConfig;

try {
  nexusConfig = await import(configPath); // dynamic import
} catch (err) {
  throw new Error("nexusConfig not found, path: " + configPath);
}

const initialStates = nexusConfig.initialStates;
const actions = nexusConfig.actions;

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

export { initialStates, reducer };
