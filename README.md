![nexus-state logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/01-banner-logo.png)

<h2></h2>

### Table of contents

- [About](#about)
- [Installation](#installation)
- [Configuration](#configuration)
- [API](#api)
  - [Main](#main)
  - [Store](#store)
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
import NXS from "nexus-state";
// or
import { createNexus, createReactNexus, createActs } from "nexus-state";
```

<h2></h2>

### API

#### Main:

<ul><div>
<details><summary><b><code>createNexus</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
creates a new framework-agnostic store instance.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and <code>actions</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createNexus } from "nexus-state";

const store = createNexus({
  state: {
    count1: 0,
    count2: 0,
  },

  actions: (get, set) => ({
    increment() {
      set((state) => ({ count1: state.count1 + 1 }));
      this.getState("count1"); // ! calling another action
    },
    getState(value) {
      console.log(`${value}:`, get(value));
    },
  }),
});

export default store;
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {
  count1: number;
  count2: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const store = createNexus<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createReactNexus</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
extends <code>createNexus</code> with React-specific hooks.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and <code>actions</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createReactNexus } from "nexus-state";

const store = createReactNexus({
  state: {
    count1: 0,
    count2: 0,
  },

  actions: (get, set) => ({
    increment() {
      set((state) => ({ count1: state.count1 + 1 }));
      this.getState("count1"); // ! calling another action
    },
    getState(value) {
      console.log(`${value}:`, get(value));
    },
  }),
});

export default store;
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {
  count1: number;
  count2: number;
};

type MyActionsT = {
  increment: () => void;
  consoleCalling: (text: string) => void;
};

const store = createReactNexus<MyStateT, MyActionsT>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createActs</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
creates a monolithic action factory that is useful for code splitting.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>create</code>: function that receives <code>set</code> and has <code>this</code> bound to the actions object.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { ✦create, createActs } from "nexus-state";

const customActions = createActs((get, set) => ({
  increment() {
    set((state) => ({ count1: state.count1 + 1 }));
    this.getState("count1"); // ! calling another action
  },
  getState(value) {
    console.log(`${value}:`, get(value));
  },
}));

// Usage:
const store = ✦create({
  state: {...},
  actions: customActions, // ! supports multiple: [myActions, myAnotherActions]
});

export default store;

// ✦create - createNexus or createReactNexus
// more about "set" in API/Store/state/set
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyStateT = {...};
type MyActionsT = {...};

const customActions = createActs<MyStateT, MyActionsT>(...);

// ✦ Note:
// use optional chaining (?) when calling other actions via "this"
const incrementAction = createActs<MyStateT, MyActionsT>(() => ({
  increment() {
    this.consoleCalling?.("Increment called"); // ?.
  },
}));
```

</details>

</div></ul></details>

</div></ul>

<h2></h2>

<details><summary>Recommendations:</summary><br><ul><div>
The store name is arbitrary, which can be helpful when working with multiple store instances:
</em><br>

```js
import { ✦create } from "nexus-state";

const myNamedStore = ✦create({...});

export default myNamedStore; // ! renamed

// ✦create - createNexus or createReactNexus
```

</div></ul></details>

<h2></h2>

#### Store:

<ul><div>

<h6><mark>core</mark></h6>

<details><summary><b><code>get()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
returns the entire state or a specific state value.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

const entireState = store.get();
const specificValue = store.get("key");
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>set()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
updates the state with a partial object or functional updater.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>update</code>: partial object or function with access to all states.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

// Direct update:
store.set({ count1: 5 });
store.set({ count1: 5, count2: 10 }); // multiple

// Functional update:
store.set((state) => ({
  count1: state.count1 + 1,
}));
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>reset()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
resets state to its initial values.<br>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

store.reset();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>subscribe()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
subscribes to changes of specific keys or entire state and returns an unsubscribe function.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>observer</code>: function to be called when state changes.</li>
  <li><code>dependencies</code>: keys to subscribe to. Use <code>["*"]</code> to listen to all.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

const unsubscribe = store.subscribe(
  // observer:
  (state) => {
    console.log("count1 changed:", state.count1);
  },
  // dependencies:
  ["count1"]
);

// Unsubscribe
unsubscribe();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>middleware()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
adds a middleware to intercept state changes before updates.<br>
Useful for logging, debugging, or integrating with developer tools.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>middleware</code>: function with previous and next state.</li>
</ul>
</em><br>
<b>Example:</b><br>

```jsx
import store from "your-nexus-config";

// Example: logging state changes
store.middleware((state, next) => {
  console.log("State changing from", state, "to", next);
});

// Example: modifying next state before applying
store.middleware((state, next) => {
  return { ...next, forced: true };
});
```

<details><summary><b>Redux DevTools Integration</b></summary><br><ul><div>
<b>Description:</b><em><br>
you can connect your store to Redux DevTools for time-travel debugging and state inspection.<br>
</em><br>
<b>Example:</b><br>

```tsx
import store from "your-nexus-config";

// Setup Redux DevTools connection
const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "MyStore",
});

devtools?.init(store.get());

// Register middleware to send state updates to DevTools
store.middleware((_, next) => {
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

<details><summary><b><code>acts</code></b></summary><br><ul><div>

<b>Description:</b><em><br>
object containing custom actions.<br>
</em><br>
<b>Usage Example:</b>

```tsx
import store from "your-nexus-config";

store.acts.increment();
store.acts.consoleCalling("Some text");
```

<br>
<b>Important:</b><em><br>
arrow functions can be used for actions, but they don’t support calling other actions via <code>this</code>:
</em><br>

```js
// regular function
increment() {
  this.consoleCalling("Increment called"); // working
}

// arrow function
increment: () => this.consoleCalling("Increment called") // not working
// but syntax is compacter
```

More info: [Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

</div></ul></details>

<h2></h2>

<h6><mark>react</mark></h6>

<details><summary><b><code>use()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook to subscribe to entire state or a state value.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

const entireState = store.use();
const specificValue = store.use("key");
```

<br>

> ✦ Note:<br>
> Unlike **get**, **use** triggers a re-render when the state changes.

</div></ul></details>

<h2></h2>

<details><summary><b><code>useSelector()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook for creating derived values from the state.<br>
</em><br>
<b>Arguments:</b><em><br>
<ul>
  <li><code>observer</code>: function that returns any derived value from the state.</li>
  <li><code>dependencies</code>: keys to subscribe to. Use <code>["*"]</code> to listen to all.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

const total = store.useSelector(
  // observer:
  (state) => state.count1 + state.count2,
  // dependencies:
  ["count1", "count2"]
);
```

<br>
<b>Optimization:</b><em><br>
use <code>useCallback</code> in frequently re-rendered components to avoid unnecessary subscriptions:
</em><br>

```tsx
import { useCallback } from "react";
import store from "your-nexus-config";

const total = store.useSelector(
  useCallback((state) => state.count1 + state.count2, []),
  ["count1", "count2"]
);
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>useRerender()</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook for forcing a component re-render.<br>
Useful for updating refs or non-reactive values.<br>
</em><br>
<b>Example:</b>

```tsx
import store from "your-nexus-config";

const updater = store.useRerender();
updater(); // force re-render
```

</div></ul></details>

</div></ul>

<h2></h2>

### License

[MIT](./publish/LICENSE)
