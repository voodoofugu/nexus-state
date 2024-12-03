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

# Getting Started in five steps

## 1. Define initialStates

Create a file, such as `nexusConfig`, where you define `initialStates`:

```javascript
export const initialStates = {
  strength: 10,
  secretPower: 5,
  // other states...
};
```

For TypeScript, it’s recommended to extend the global `StatesT` and `FuncsT` interfaces provided by the library. The simplest way is to use `typeof`:

🔮 _Make sure to configure `tsconfig` properly._

```typescript
type InitialStatesT = typeof initialStates;

declare global {
  interface StatesT extends InitialStatesT {}
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

#### 2. Define all states manually if there are only a few:

```javascript
declare global {
  interface StatesT {
    strength: number;
    secretPower: number;
  }
}
```

#### 3. Simply ignore the warning. 🙌

---

## 2. Wrap your app with NexusProvider

Wrap your application with `NexusProvider`, passing in `initialStates`:

```javascript
import { NexusProvider } from "nexus-state;
import { initialStates } from "./nexusConfig";

const App = () => (
  <NexusProvider initialStates={initialStates}>
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
import { useNexusSelect } from "nexus-state";

const YourComponent = () => {
  const fullPower = useNexusSelect(
    (state) => state.strength + state.secretPower
  );

  return <p>`🧙‍♂️ Your full power is ${fullPower}`</p>;
};
```

---

## 5. Update states with nexusUpdate

To update the state, use the `nexusUpdate` function. You can transmit values directly:

```javascript
const levelUp = () => {
  nexusUpdate({
    strength: 15,
  });
};
```

Or get the previous value and work with it:

```javascript
const levelUp = () => {
  nexusUpdate({
    strength: (prevState) => prevState + 5,
  });
};
```

You can also pass as many values as you want, you are limited only by the number of states you have created:

```javascript
import { nexusUpdate } from "nexus-state";

const levelUp = () => {
  nexusUpdate({
    strength: (prevState) => prevState + 5,
    secretPower: (prevState) => prevState + 1,
  });
};

const YourButton = () => {
  return <button onClick={levelUp}>`🧙‍♂️ Raise the level`</button>;
};
```

---

🎉 _Hurray! You already have everything you need to start working with global states. Next are the additional features of nexus-state._

---

## Calling custom functions using the nexusEffect

Since there are many disadvantages of storing functions in states and the practical impossibility of their further use, `nexus-state` provides the possibility of creating a storage center for user functions and further calling them via `nexusEffect`.

### Getting started with `nexusEffect`:

#### 1. Define initialFuncs:

```javascript
import { nexusEffect } from "nexus-state";

const levelUp = () => {
  nexusEffect({
    type: "LEVEL_UP",
    payload: 5,
  });
};

const YourButton = () => {
  return <button onClick={levelUp}>`🧙‍♂️ Raise the level`</button>;
};
```

The nexus Dispatch function also supports an array of action objects, allowing you to conveniently dispatch multiple actions at once. Batch processing is built-in to handle these actions efficiently.

```javascript
const levelUp = () => {
  nexusEffect([
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

🔮 _If you’ve set up global types properly, `useNexus`, `useNexusSelect`, and `nexusEffect` will benefit from full type inference, including autocompletion for the type field._

---

# API

- `NexusProvider`: Provider Component to wrap your application.
- `useNexus`: Hook for accessing a state by key.
- `useNexusSelect`: Hook for computed or derived state values.
- `nexusUpdate`: Function to update your states.
- `nexusEffect`: Function to dispatch actions.

---

## Conclusion

I hope using `nexus-state` makes your development enjoyable and productive! ✨
