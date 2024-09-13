import React from "react";
import { NexusContextProvider } from "./nexusStore";
import Storage from "./Storage";

const NexusProvider = ({ watch, children }) => {
  return (
    <NexusContextProvider>
      {typeof window !== "undefined" && <Storage watch={watch} />}
      {children}
    </NexusContextProvider>
  );
};
export default NexusProvider;
