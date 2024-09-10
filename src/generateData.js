const configPath = process.env.NEXUS_CONFIG_PATH || "./nexusConfig";

const defaultConfig = {
  initialStates: {},
  actions: {},
};

let nexusConfig;
try {
  nexusConfig = await import(configPath).then(
    (module) => module.default || module
  );
} catch (err) {
  console.warn("nexusConfig not found");
  nexusConfig = defaultConfig;
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
