# nexus-state ✨

## Table of contents

- [About](#About)
- [Installation](#Installation)
- [InitialStates](#InitialStates)
- [NexusProvider](#NexusProvider)
- [useNexus](#useNexus)
- [useNexusSelect](#useNexusSelect)
- [nexusUpdate](#nexusUpdate)
- [nexusEffect](#nexusEffect)
- [Motivation](#Motivation)
- [API](#API)

## About

A lightweight and flexible state management library for `React` applications with `TypeScript` support. With `nexus-state`, you can easily build complex state structures.
While the library works with JavaScript, using TypeScript unlocks the full potential of type inference and autocompletion.

## Installation

Install the library using the following command:

```bash
npm install nexus-state
```

---

## InitialStates

Create a file, such as `nexusConfig`, where you define `initialStates`:

```javascript
export const initialStates = {
  strength: 10,
  secretPower: 5,
  // other states...
};
```

### 🛠 Configuring TypeScript for nexus-state

For TypeScript, extend the global `StatesT` interface provided by the library. The simplest way is to use `typeof`:

```typescript
type InitialStatesT = typeof initialStates;

declare global {
  interface StatesT extends InitialStatesT {}
}
```

The `nexus-state` library comes with the default type `_NEXUS_` in `StatesT`. For more information, see the `nexusUpdate` section.

🔮 _Make sure to configure `tsconfig` properly._

---

## NexusProvider

Wrap your application with `NexusProvider`, passing in `initialStates`:

```javascript
import { NexusProvider } from "nexus-state";
import { initialStates } from "./nexusConfig";

const App = () => (
  <NexusProvider initialStates={initialStates}>
    <YourComponent />
  </NexusProvider>
);
```

---

## useNexus

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

## useNexusSelect

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

## nexusUpdate

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

For use in `nexusUpdate`, it supplies one default type `_NEXUS_` to `StatesT`. It is used to update all user states.
This can help you update all the states at one time they are stored remotely:

```javascript
nexusUpdate({
  _NEXUS_: fetchedData,
});
```

---

🎉 _Hurray! You already have everything you need to start working with global states. Next are the additional features of nexus-state._

---

## nexusEffect

Since there are many disadvantages of storing functions in states and the practical impossibility of their further use, `nexus-state` provides the possibility of creating a storage center for user functions and further calling them via `nexusEffect`.
To get started with the `nexusEffect`, you need to:

#### 1. Define initialFuncs in your config:

```javascript
export const initialFuncs = {
  playerActions: {
    fData: (payload) => {
      console.log("Current player action:", payload);
    },
  },
  // over funcs
};
```

For TypeScript, extend the global `FuncsT` interface in the same way as `StatesT`:

```typescript
type InitialStatesT = typeof initialStates;
type InitialFuncsT = typeof initialFuncs;

declare global {
  interface StatesT extends InitialStatesT {}
  interface FuncsT extends InitialFuncsT {}
}
```

#### 2. Transfer the initialFuncs to the NexusProvider

Wrap your application with `NexusProvider`, passing in `initialStates`:

```javascript
import { NexusProvider } from "nexus-state;
import { initialStates, initialFuncs } from "./nexusConfig";

const App = () => (
  <NexusProvider initialStates={initialStates} initialFuncs={initialFuncs}>
    <YourComponent />
  </NexusProvider>
);
```

#### 3. Use nexusEffect

```javascript
import { nexusEffect } from "nexus-state";

const actionDefiner = () => {
  nexusEffect({
    type: "playerActions",
    payload: "The hero waves his sword!",
  });
};

const YourButton = () => {
  return <button onClick={actionDefiner}>`🧙‍♂️ What does the hero do?`</button>;
};
```

So you can use `nexusEffect`, but its true power is shown in using it together with `nexusUpdate`, as it is also a simple function.
This way you can think through complex user logic:

```javascript
import { nexusUpdate } from "nexus-state";

const powerUp = {
  fData: ({ param, data }) => {
    switch (param) {
      case "strength": {
        nexusUpdate({
          strength: (prevState) => prevState + data,
        });
        return;
      }

      case "secretPower": {
        nexusUpdate({
          secretPower: (prevState) => prevState + data,
        });
        return;
      }

      default:
        return;
    }
  },
};

export const initialFuncs = {
  powerUp,
  // over funcs
};
```

In this example, we have created a `function` with a `switch` `case` design and the ability to change the desired state.
Usage example:

```javascript
import { nexusEffect } from "nexus-state";

const powerUpCall = () => {
  nexusEffect({
    type: "powerUp",
    payload: {
      param: "strength",
      data: 5,
    },
  });
};

const YourButton = () => {
  return (
    <button onClick={powerUpCall}>`🧙‍♂️ Increase the desired parameter`</button>
  );
};
```

---

## Problems

### No-empty-object-type error:

If you use `eslint`, you might encounter an error about empty object types (`@typescript-eslint/no-empty-object-type`), but this is easy to fix:

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

## Motivation

This library came about by chance. I hadn't planned on using a state manager and simply updated states based on a flux-like architecture. Over time, I wanted to isolate state management into a separate component, which led to the creation of this library.

The name "Nexus" was inspired by the game Demon's Souls, where the "Nexus" serves as a safe haven for the player and a starting point. Similarly, with `nexus-state`, I wanted users to feel connected to a place like the "Nexus" or a bonfire from Dark Souls, where they can start their journey to anywhere.
🔥🗡️

I hope using `nexus-state` makes your development enjoyable and productive! ✨

---

## API

- `NexusProvider`: Provider Component to wrap your application.
- `useNexus`: Hook for accessing a state by key.
- `useNexusSelect`: Hook for computed or derived state values.
- `nexusUpdate`: Function to update your states.
- `nexusEffect`: Function to dispatch actions.
