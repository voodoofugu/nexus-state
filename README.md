![nexus-state logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/01-banner-logo.png)

<h2></h2>

### Table of contents

- [About](#about)
- [Installation](#installation)
- [Configuration](#configuration)
- [API](#api)
- [License](#license)

<h2></h2>

### About

Lightweight, framework-agnostic state management with optional actions and React bindings.
Designed for simplicity and performance with TypeScript support.

<h2></h2>

### Installation

```bash
npm install nexus-state
```

<h2></h2>

### Configuration

The library provides two separate builds:

> - **Modern bundlers** use the **ESM** (`import`) build
> - **Node.js** use the **CommonJS** (`require`) build

<h2></h2>

### API

**Main:**

<ul><div>
<details><summary><b><code>createStore</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Creates a new framework-agnostic store instance.<br>
</em><br>
<b>Example:</b>

```js
import { createStore } from "nexus-state";

const { state, actions } = createStore({
  state: {
    count: 0,
    userCount: 0,
  },

  actions: (set) => ({
    increment() {
      set((prev) => ({ count: prev.count + 1 }));
      this.consoleCalling("Increment called"); // calling another action
    },
    consoleCalling(text) {
      console.log(text);
    },
  }),
});

export { state, actions };
```

<details><summary><b><code>TypeScript Snippet:</code></b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const { state, actions } = createStore<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createReactStore</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Extends <code>createStore</code> with React-specific hooks.<br>
</em><br>
<b>Example:</b>

```js
import { createReactStore } from "nexus-state";

const { state, actions } = createReactStore({
  state: {
    count: 0,
    userCount: 0,
  },

  actions: (set) => ({
    increment() {
      set((prev) => ({ count: prev.count + 1 }));
      this.consoleCalling("Increment called"); // calling another action
    },
    consoleCalling(text) {
      console.log(text);
    },
  }),
});

export { state, actions };
```

<details><summary><b><code>TypeScript Snippet:</code></b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const { state, actions } = createReactStore<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createActions</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Creates a monolithic action factory and useful for code splitting.<br>
</em><br>
<b>Example:</b>

```js
import { ✦store, createActions } from "nexus-state";

const customActions = createActions((set) => ({
  increment() {
    set((prev) => ({ count: prev.count + 1 }));
    this.consoleCalling("Increment called");
  },
  consoleCalling(text) {
    console.log(text);
  },
}));

const { state, actions } = ✦store({
  state: {...},
  actions: customActions, // provide all actions
});

export { state, actions };

// ✦store - createStore or createReactStore
```

<details><summary><b><code>TypeScript Snippet:</code></b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const customActions = createActions<MyStateT, MyActionsT>((set) => ({...}));
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createDiscreteActions</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Creates a discrete action factory and useful for code splitting.<br>
</em><br>
<b>Example:</b>

```js
import { ✦store, createDiscreteActions } from "nexus-state";

const incrementAction = createDiscreteActions(
  (set) => ({
    increment() {
      set((prev) => ({ value2: prev.value2 + 1 }));
      this.consoleCalling("Increment called");
    },
  })
);

const consoleCallAction = createDiscreteActions(() => ({
  consoleCalling(text) {
    console.log(text);
  },
}));

const { state, actions } = ✦store({
  state: {...},
  actions: [incrementAction, consoleCallAction], // array of discrete actions
});

export { state, actions };

// ✦store - createStore or createReactStore
```

<details><summary><b><code>TypeScript Snippet:</code></b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const incrementAction = createDiscreteActions<MyStateT, MyActionsT>((set) => ({
  increment() {
    // Use `?.` when referencing optional actions type (MyActionsT)
    this.consoleCalling?.("Increment called");
  },
}));

const consoleCallAction = createDiscreteActions<MyStateT, MyActionsT>(() => ({...}));
```

</details>

</div></ul></details>

> ✦ Note:<br>
> If you want to rename the store, use the following syntax:<br>

```js
import { ✦store, createDiscreteActions } from "nexus-state";

const { state: myStore, actions: myActions } = ✦store({
  state: {...},
  actions: (set) => ({...}),
});

export { myStore, myActions };

// ✦store - createStore or createReactStore
```

</div></ul>

<h2></h2>

**Store:**

<ul><div>

<details><summary><b><code>state</code></b></summary><br><ul><div>

<b>Description:</b> <em><br>
Required state object.<br>
</em><br>
<b>Usage Example:</b>

<h6><mark>core</mark></h6>

<details><summary><b><code>getNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Returns the entire state or a specific state value.<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

const allStates = state.getNexus(); // entire state
const count = state.getNexus("count"); // specific state value
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>setNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Updates the state object. You can pass a partial object or a function with access to the previous state.<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

// Direct update:
state.setNexus({ count: 5 });

// Functional update:
state.setNexus((prev) => ({
  count: prev.count + 1,
}));

// Update multiple keys:
state.setNexus({ count: 5, userCount: 10 });
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusReset()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Resets state to its initial values.<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

state.nexusReset();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusSubscribe()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Subscribes to changes of specific keys or entire state and returns an unsubscribe function.<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

const unsubscribe = state.nexusSubscribe(
  (state) => console.log("count changed:", state.count),
  ["count"]
);

// Unsubscribe
unsubscribe();
```

> ✦ Note:<br>
> If you pass an empty array, it will subscribe to the entire state.<br>

```tsx
const unsubscribe = state.nexusSubscribe(
  (state) => console.log("count changed:", state.count),
  [] // subscribe to the entire state
);
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusGate()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Adds a middleware to intercept state changes before updates.<br>
Useful for logging, debugging, or integrating with developer tools.<br>
</em><br>
<b>Example:</b><br>

```jsx
import { state } from "your-nexus-config";

// Example: logging state changes
state.nexusGate((prev, next) => {
  console.log("State changing from", prev, "to", next);
});

// Example: modifying next state before applying
state.nexusGate((prev, next) => {
  return { ...next, forced: true };
});
```

<details><summary><b>Redux DevTools Integration</b></summary><br><ul><div>
<b>Description:</b> <em><br>
You can connect your Nexus store to Redux DevTools for time-travel debugging and state inspection.<br>
</em><br>
<b>Example:</b><br>

```tsx
import { state } from "your-nexus-config";

// Setup Redux DevTools connection
const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "MyStore",
});

devtools?.init(state.getNexus());

// Register middleware to send state updates to DevTools
state.nexusGate((_, next) => {
  devtools?.send?.({ type: "UPDATE" }, next);
});
```

<details><summary><b><code>TypeScript Snippet:</code></b></summary>

```tsx
interface ReduxDevToolsConnection {
  send: (action: unknown, state: unknown) => void;
  init: (state: unknown) => void;
}

interface ReduxDevToolsExtension {
  connect(options: { name: string }): ReduxDevToolsConnection;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension;
  }
}
```

</details>

</div></ul></details>

</div></ul></details>

<h2></h2>

<h6><mark>react</mark></h6>

<details><summary><b><code>useNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
`React` hook to subscribe to entire state or a state value. Automatically triggers re-renders when subscribed state changes.<br>
<br>
<ul>
  <li><b>Without arguments:</b> returns the entire state object.</li>
  <li><b>With key argument:</b> subscribes to a specific state value.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

const fullState = state.useNexus(); // entire state
const count = state.useNexus("count"); // specific state value
```

> ✦ Note:<br>
> The main difference between **useNexus** and **getNexus** is that changing a state value accessed through **useNexus** automatically triggers a rerender.

</div></ul></details>

<h2></h2>

<details><summary><b><code>useNexusSelector()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
A React hook for creating derived values from the state.<br>
<br>
Arguments:
<ul>
  <li><code>observer</code>: function that returns any derived value from the state.</li>
  <li><code>dependencies</code>: array of keys to subscribe to or empty array for entire state..</li>
</ul>
<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

const total = state.useNexusSelector(
  (state) => state.count + state.userCount, // observer function
  ["count", "userCount"] // dependencies
);

// If you pass an empty array in the dependencies, it will subscribe to the entire state:
const total = state.useNexusSelector(
  (state) => state.count + state.userCount,
  [] // subscribe to the entire state
);
```

> ✦ Note:<br>
> If the component using **useNexusSelector** re-renders frequently, it’s best to wrap the selector function in a **useCallback**:

```tsx
import { useCallback } from "react";
import { state } from "your-nexus-config";

const total = state.useNexusSelector(
  // avoid unnecessary subscriptions
  useCallback((state) => state.count + state.userCount, []),
  ["count", "userCount"]
);
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>useUpdate()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
React hook for forcing a component re-render.<br>
Useful for updating refs or non-reactive values.<br>
</em><br>
<b>Example:</b>

```tsx
import { state } from "your-nexus-config";

const updater = state.useUpdate();
updater(); // force re-render
```

</div></ul></details>

</div></ul>
</details>

<h2></h2>

<details><summary><b><code>actions</code></b></summary><br><ul><div>

<b>Description:</b> <em><br>
Optional actions object defined during store creation, simplifying state updates.<br>
</em><br>
<b>Usage Example:</b>

```tsx
import { actions } from "your-nexus-config";

actions.increment();
actions.consoleCalling("Some text");
```

> ✦ Note:<br>
> Arrow functions can be used for actions, but they don’t support calling other actions via **this**:

```js
// regular function
increment() {
  this.consoleCalling("Increment called"); // working
}

// arrow function
increment: () => {
  this.consoleCalling("Increment called"); // not working
}
```

</div></ul>
</details>

</div></ul>

<h2></h2>

### License

[MIT](./publish/LICENSE)
