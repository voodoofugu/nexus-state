import React from "react";
import { useNexusAll } from "./nexusStore";

export interface watchType {
  watch?: boolean;
}

interface SessionStorProps extends watchType {}

export default function Storage({
  watch,
}: SessionStorProps): React.ReactElement | null {
  const states = useNexusAll();
  const isEmpty = (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0;
  };

  const { statesForWatch, localStates, sessionStates } = React.useMemo(() => {
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

  React.useEffect(() => {
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
