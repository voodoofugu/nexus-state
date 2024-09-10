import React from "react";
import context from "./context";
import Storage from "./Storage";
import { initialStates, reducer } from "./generateData";

const { useNexus, useNexusAll, NexusContextProvider } = context(
  initialStates,
  reducer
);

const isClient = typeof window !== "undefined";

const NexusProvider = ({ watch, children }) => {
  return (
    <NexusContextProvider>
      {isClient && <Storage watch={watch} />}
      {children}
    </NexusContextProvider>
  );
};

export { useNexus, useNexusAll, NexusProvider };
