# nexus-state ✨

A lightweight and flexible state management library for React applications with TypeScript's strong typing support. With `nexus-state`, you can easily build complex state structures while minimizing re-renders. While the library works with JavaScript, using TypeScript unlocks the full potential of type inference and autocompletion.

This library came about by chance. I hadn't planned on using a state manager and simply updated states based on a flux-like architecture. Over time, I wanted to isolate state management into a separate component, which led to the creation of this library.

The name "Nexus" was inspired by the game Demon's Souls, where the "Nexus" serves as a safe haven for the player and a starting point. Similarly, with `nexus-state`, I wanted users to feel connected to a place like the "Nexus" or a bonfire from Dark Souls, where they can start their journey to anywhere.
🔥🗡️

## Installation

Install the library using the following command:

```bash
npm install nexus-state
```

---

# Getting Started

## 1. Define initialStates, actions, and use nexusAction

Create a file, such as `nexusConfig`, where you define `initialStates` and `actions`. Use the `nexusAction` helper function for defining `actions`:

```javascript
import { nexusAction } from "nexus-state";

export const initialStates = {
  strength: 10,
  secretPower: 5,
  // other states...
};

export const actions = {
  LEVEL_UP: nexusAction((state, action) => ({
    ...state,
    strength: state.strength + action.payload,
  })),
  POWER_UP: nexusAction((state, action) => ({
    ...state,
    secretPower: state.secretPower + action.payload,
  })),
  // other actions...
};
```

You can also move the action logic to separate variables and store them wherever you prefer:

```javascript
import { nexusAction } from "nexus-state";

const LEVEL_UP = nexusAction((state, action) => ({
  ...state,
  strength: state.strength + action.payload,
}));

export const actions = {
  LEVEL_UP,
  // other actions...
};
```

For TypeScript, it’s recommended to extend the global `StatesT` and `ActionsT` interfaces provided by the library. The simplest way is to use `typeof`:

🔮 _Make sure to configure `tsconfig` properly._

```typescript
type InitialStatesT = typeof initialStates;
type InitialActionsT = typeof actions;

declare global {
  interface StatesT extends InitialStatesT {}
  interface ActionsT extends InitialActionsT {}
}
```

🔮 _If you use `eslint`, you might encounter an error about empty object types (`@typescript-eslint/no-empty-object-type`), but this is easy to fix._

### Ways to address the no-empty-object-type error:

#### 1. Add a rule to eslint:

```typescript
rules: {
      "@typescript-eslint/no-empty-object-type": "off",
}
```

#### 2. Define all states and actions manually if there are only a few:

```javascript
declare global {
  interface StatesT {
    strength: number;
    secretPower: number;
  }
  interface ActionsT {
    LEVEL_UP: string;
  }
}
```

#### 3. Simply ignore the warning. 🙌

---

## 2. Wrap your app with NexusProvider

Wrap your application with `NexusProvider`, passing in `initialStates` and `actions`:

```javascript
import { NexusProvider } from "nexus-state;
import { initialStates, actions } from "./nexusConfig";

const App = () => (
  <NexusProvider initialStates={initialStates} actions={actions}>
    <YourComponent />
  </NexusProvider>
);
```

---

## 3. Access states with useNexus

To access a state value, use the `useNexus` hook:

```javascript
import { useNexus } from "nexus-state";

const YourComponent = () => {
  const strength = useNexus("strength");

  return <p>`🧙‍♂️ Your strength is ${strength}`</p>;
};
```

🔮 _If you call `useNexus` empty then you will get all your states. This can be useful for debugging._

---

## 4. Use useNexusSelect for computed values

If you need to calculate derived data from the state, use the `useNexusSelect` hook:

```javascript
import { useNexusSelect } from "nexus-state;

const YourComponent = () => {
  const fullPower = useNexusSelect(
    (state) => state.strength + state.secretPower
  );

  return <p>`🧙‍♂️ Your full power is ${fullPower}`</p>;
};
```

---

## 5. Dispatch actions with nexusDispatch

To update the state, use the `nexusDispatch` function:

```javascript
import { nexusDispatch } from "nexus-state;

const levelUp = () => {
  nexusDispatch({
    type: "LEVEL_UP",
    payload: 5,
  });
};

const YourButton= () => {
  return <button onClick={levelUp}>`🧙‍♂️ Raise the level`</button>;
};
```

The nexus Dispatch function also supports an array of action objects, allowing you to conveniently dispatch multiple actions at once. Batch processing is built-in to handle these actions efficiently.

```javascript
const levelUp = () => {
  nexusDispatch([
    {
      type: "LEVEL_UP",
      payload: 5,
    },
    {
      type: "POWER_UP",
      payload: 1,
    },
  ]);
};
```

🔮 _If you’ve set up global types properly, `useNexus`, `useNexusSelect`, and `nexusDispatch` will benefit from full type inference, including autocompletion for the type field._

---

# API

- `NexusProvider`: Provider Component to wrap your application.
- `useNexus`: Hook for accessing a state by key.
- `useNexusSelect`: Hook for computed or derived state values.
- `nexusDispatch`: Function to dispatch actions.
- `nexusAction`: Function for creating actions.

---

## Conclusion

I hope using `nexus-state` makes your development enjoyable and productive! ✨
