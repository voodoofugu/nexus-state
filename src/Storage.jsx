import React, { useEffect, useMemo } from "react";

export default function Storage({ useNexusAll, watch }) {
  const states = useNexusAll();
  const isEmpty = (obj) => Object.keys(obj).length === 0;

  const { statesForWatch, localStates, sessionStates } = useMemo(() => {
    if (!states) {
      return { statesForWatch: {}, localStates: {}, sessionStates: {} };
    }
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
      localStorage.setItem("nexusStorage_l", JSON.stringify(localStates));
    !isEmpty(sessionStates) &&
      sessionStorage.setItem("nexusStorage_s", JSON.stringify(sessionStates));

    if (watch) {
      sessionStorage.setItem("nexusWatch", JSON.stringify(statesForWatch));
    }
  }, [localStates, sessionStates, statesForWatch, watch]);

  return null;
}
