import React from "react";
import context from "./context";
import Storage from "./Storage";

let initialStates = {};
let actions = {};

(function () {
  if (configureNexus) {
    initialStates = configureNexus.initialStates;
    actions = configureNexus.actions;
  }
})();

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

const { useNexus, useNexusAll, NexusContextProvider } = context(
  initialStates,
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

export { useNexus, useNexusAll, NexusProvider, configureNexus };
