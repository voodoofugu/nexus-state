import React, { useEffect } from "react";
import { useNexusAll } from "./nexusStore";

export default function Storage({ watch }) {
  const states = useNexusAll();
  const isEmpty = (obj) => Object.keys(obj).length === 0;

  const { statesForWatch, localStates, sessionStates } = useMemo(() => {
    const localStates = Object.fromEntries(
      Object.entries(states).filter(([key]) => key.endsWith("_l"))
    );
    const sessionStates = Object.fromEntries(
      Object.entries(states).filter(([key]) => key.endsWith("_s"))
    );
    const statesForWatch = Object.fromEntries(
      Object.entries(states).filter(
        ([key]) => !key.endsWith("_s") && !key.endsWith("_l")
      )
    );
    return { statesForWatch, localStates, sessionStates };
  }, [states]);

  useEffect(() => {
    !isEmpty(localStates) &&
      localStorage.setItem("📌", JSON.stringify(localStates));
    !isEmpty(sessionStates) &&
      sessionStorage.setItem("📌", JSON.stringify(sessionStates));

    if (watch) {
      sessionStorage.setItem("👁", JSON.stringify(statesForWatch));
    }
  }, [localStates, sessionStates, statesForWatch, watch]);

  return null;
}
