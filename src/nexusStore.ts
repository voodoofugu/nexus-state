import React, { createContext, useContext } from "react";
import context from "./context";
import Storage from "./Storage";

interface Config {
  initialStates: Record<string, any>;
  actions: Record<
    string,
    {
      reducer?: (state: any, action: any) => any;
    }
  >;
}

// Редьюсер, использующий действия из конфигурации
function createReducer(actions: Config["actions"]) {
  return function reducerNexus(
    state: any,
    action: { type: string; payload?: any }
  ): any {
    const type = action.type as keyof typeof actions;
    const payload = action.payload;

    if (actions[type]) {
      const config = actions[type] as {
        reducer?: (state: any, action: any) => any;
      };

      if (config.reducer) {
        return config.reducer(state, action);
      } else {
        return {
          ...state,
          ...payload,
        };
      }
    }

    return state;
  };
}

// Создаём контекст, используя динамические начальные состояния и редьюсер
const NexusContext = createContext<ReturnType<typeof context> | null>(null);

interface ProviderProps {
  initialStates: Config["initialStates"];
  actions: Config["actions"];
  watch?: boolean;
  children: React.ReactNode;
}

// NexusProvider принимает конфигурацию состояний и редьюсера
const NexusProvider: React.FC<ProviderProps> = ({
  initialStates,
  actions,
  watch,
  children,
}) => {
  // Создаём редьюсер на основе переданных действий
  const reducer = createReducer(actions);

  // Создаём динамический контекст с помощью вашей функции context
  const nexusContext = context(initialStates, reducer);

  return (
    <NexusContext.Provider value={nexusContext}>
      <nexusContext.NexusContextProvider>
        <Storage watch={watch} />
        {children}
      </nexusContext.NexusContextProvider>
    </NexusContext.Provider>
  );
};

// Хуки для работы с состоянием
const useGetNexus = (stateName: string) => {
  const ctx = useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found");
  }
  return ctx.useGetNexus(stateName);
};

const useSetNexus = () => {
  const ctx = useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found");
  }
  return ctx.useSetNexus();
};

const useNexusAll = () => {
  const ctx = useContext(NexusContext);
  if (!ctx) {
    throw new Error("NexusProvider not found");
  }
  return ctx.useNexusAll();
};

// Экспортируем хуки и провайдер
export { useGetNexus, useSetNexus, useNexusAll, NexusProvider };
