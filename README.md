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

Import the entire API via the default export or as individual named imports:

```js
import nexus from "nexus-state";
// or
import { createStore, createReactStore, createActions } from "nexus-state";
```

<h2></h2>

### API

#### Main:

<ul><div>
<details><summary><b><code>createStore</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Creates a new framework-agnostic store instance.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and <code>actions</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createStore } from "nexus-state";

const { store, actions } = createStore({
  state: {
    count: 0,
    userCount: 0,
  },

  actions: (setNexus) => ({
    increment() {
      setNexus((prev) => ({ count: prev.count + 1 }));
      this.consoleCalling("Increment called"); // ! calling another action
    },
    consoleCalling(text) {
      console.log(text);
    },
  }),
});

export { store, actions };
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const { store, actions } = createStore<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createReactStore</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Extends <code>createStore</code> with React-specific hooks.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and <code>actions</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createReactStore } from "nexus-state";

const { store, actions } = createReactStore({
  state: {
    count: 0,
    userCount: 0,
  },

  actions: (setNexus) => ({
    increment() {
      setNexus((prev) => ({ count: prev.count + 1 }));
      this.consoleCalling("Increment called"); // ! calling another action
    },
    consoleCalling(text) {
      console.log(text);
    },
  }),
});

export { store, actions };
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {
  count: number;
  userCount: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const { store, actions } = createReactStore<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createActions</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Creates a monolithic action factory that is useful for code splitting.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>create</code>: function that receives <code>setNexus</code> and has <code>this</code> bound to the actions object.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { ✦store, createActions } from "nexus-state";

const customActions = createActions((setNexus) => ({
  increment() {
    setNexus((prev) => ({ count: prev.count + 1 }));
    this.consoleCalling("Increment called"); // ! calling another action
  },
  consoleCalling(text) {
    console.log(text);
  },
}));

const { store, actions } = ✦store({
  state: {...},
  actions: customActions, // ! supports multiple: [myActions, myAnotherActions]
});

export { store, actions };

// ✦store - createStore or createReactStore
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {...};
type MyActionsT = {...};

const customActions = createActions<MyStateT, MyActionsT>((setNexus) => ({...}));

// Note:
// use optional chaining (?.) when calling actions from other scopes.
const incrementAction = createActions<MyStateT, MyActionsT>(() => ({
  increment(setNexus) {
    // increment logic
    this.consoleCalling?.("Increment called"); // ?.
  },
}));
```

</details>

</div></ul></details>

</div></ul>

<h2></h2>

<details><summary>Recommendations:</summary><br><ul><div>
If you want to use multiple stores in a single file, or if you want to simply rename an store, use the following syntax:
</em><br>

```js
import { ✦store } from "nexus-state";

const { store: myStore1, actions: myActions1 } = ✦store({...});

export { myStore1, myActions1 }; // ! renamed

// ✦store - createStore or createReactStore
```

</div></ul></details>

<h2></h2>

#### Store:

<ul><div>

<details><summary><b><code>state</code></b></summary><br><ul><div>

<b>Description:</b><em><br>
Required state object.<br>
</em><br>
<b>Usage Example:</b>

<h6><mark>core</mark></h6>

<details><summary><b><code>getNexus()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Returns the entire state or a specific state value.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

const entireState = store.getNexus();
const specificValue = store.getNexus("key");
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>setNexus()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Updates the state with either a partial object or a functional updater.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>update</code>: partial object or function with the previous state.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

// Direct update:
store.setNexus({ count: 5 });
store.setNexus({ count: 5, userCount: 10 }); // multiple updates

// Functional update:
store.setNexus((prev) => ({
  count: prev.count + 1,
}));
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusReset()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Resets state to its initial values.<br>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

store.nexusReset();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusSubscribe()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Subscribes to changes of specific keys or entire state and returns an unsubscribe function.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>observer</code>: function to be called when state changes.</li>
  <li><code>dependencies</code>: array of keys for subscription.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

const unsubscribe = store.nexusSubscribe(
  // observer:
  (state) => {
    console.log("count changed:", state.count);
  },
  // dependencies:
  ["count"]
);

// Unsubscribe
unsubscribe();

// Dependency options:
// ["key1", "key2"] - listen to specific state changes
// ["*"] - listen to all state changes
// [] - no subscription
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusGate()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
Adds a middleware to intercept state changes before updates.<br>
Useful for logging, debugging, or integrating with developer tools.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>middleware</code>: function with previous and next state.</li>
</ul>
</em><br>
<b>Example:</b><br>

```jsx
import { store } from "your-nexus-config";

// Example: logging state changes
store.nexusGate((prev, next) => {
  console.log("State changing from", prev, "to", next);
});

// Example: modifying next state before applying
store.nexusGate((prev, next) => {
  return { ...next, forced: true };
});
```

<details><summary><b>Redux DevTools Integration</b></summary><br><ul><div>
<b>Description:</b><em><br>
You can connect your Nexus store to Redux DevTools for time-travel debugging and state inspection.<br>
</em><br>
<b>Example:</b><br>

```tsx
import { store } from "your-nexus-config";

// Setup Redux DevTools connection
const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "MyStore",
});

devtools?.init(store.getNexus());

// Register middleware to send state updates to DevTools
store.nexusGate((_, next) => {
  devtools?.send?.({ type: "UPDATE" }, next);
});
```

<details><summary><b>TypeScript Snippet:</b></summary>

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
<b>Description:</b><em><br>
<code>React</code> hook to subscribe to entire state or a state value.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

const entireState = store.useNexus();
const specificValue = store.useNexus("key");
```

<br>

> ✦ Note:<br>
> Unlike **getNexus**, **useNexus** triggers a re-render when the state changes.

</div></ul></details>

<h2></h2>

<details><summary><b><code>useNexusSelector()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>React</code> hook for creating derived values from the state.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>observer</code>: function that returns any derived value from the state.</li>
  <li><code>dependencies</code>: array of keys for subscription.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

const total = store.useNexusSelector(
  // observer:
  (state) => state.count + state.userCount,
  // dependencies:
  ["count", "userCount"]
);

// Dependency options:
// ["key1", "key2"] - listen to specific state changes
// ["*"] - listen to all state changes
// [] - no subscription
```

<br>
<b>Optimization:</b><em><br>
If the component re-renders often, wrap the observer function in <code>useCallback</code>:
</em><br>

```tsx
import { useCallback } from "react";
import { store } from "your-nexus-config";

const total = store.useNexusSelector(
  // ! "useCallback" avoid unnecessary subscriptions
  useCallback((state) => state.count + state.userCount, []),
  ["count", "userCount"]
);
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>useUpdate()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>React</code> hook for forcing a component re-render.<br>
Useful for updating refs or non-reactive values.<br>
</em><br>
<b>Example:</b>

```tsx
import { store } from "your-nexus-config";

const updater = store.useUpdate();
updater(); // force re-render
```

</div></ul></details>

</div></ul>
</details>

<h2></h2>

<details><summary><b><code>actions</code></b></summary><br><ul><div>

<b>Description:</b><em><br>
Optional actions object defined during store creation, simplifying state updates.<br>
</em><br>
<b>Usage Example:</b>

```tsx
import { actions } from "your-nexus-config";

actions.increment();
actions.consoleCalling("Some text");
```

<br>
<b>Important:</b><em><br>
Arrow functions can be used for actions, but they don’t support calling other actions via <code>this</code>:
</em><br>

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
