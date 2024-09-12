import React from "react";
import context from "./context";
import Storage from "./Storage";

let initialStatesLocal = {};
let actionsLocal = {};

try {
  const nexusConfig = require("../../nexusConfig");
  initialStatesLocal = nexusConfig.initialStates || {};
  actionsLocal = nexusConfig.actions || {};
} catch (e) {
  if (e.code === "MODULE_NOT_FOUND") {
    console.warn("🕵️‍♂️ nexusConfig not found.");
  } else {
    throw e;
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

const NexusProvider = ({ watch, children }) => {
  return (
    <NexusContextProvider>
      {typeof window !== "undefined" && <Storage watch={watch} />}
      {children}
    </NexusContextProvider>
  );
};

export { useNexus, useNexusAll, NexusProvider };
