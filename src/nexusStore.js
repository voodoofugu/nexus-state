import context from "./context";

let initialStatesLocal = {};
let actionsLocal = {};

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  try {
    // Используйте путь относительно текущего рабочего каталога
    const configPath = path.resolve(process.cwd(), "nexusConfig.js");
    // Путь должен быть внешним и доступным пользователю
    const nexusConfig = require(configPath);
    initialStatesLocal = nexusConfig.initialStates || {};
    actionsLocal = nexusConfig.actions || {};
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      console.warn("🕵️‍♂️ nexusConfig not found.");
    } else {
      throw e;
    }
  }
}

function reducer(state, action) {
  const type = action.type;
  const payload = action.payload;

  if (actionsLocal[type]) {
    const config = actionsLocal[type];

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

const { useNexus, useNexusAll, NexusContextProvider } = context(
  initialStatesLocal,
  reducer
);

export { useNexus, useNexusAll, NexusContextProvider };
