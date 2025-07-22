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
Designed for simplicity and performance.

<h2></h2>

### Installation

```bash
npm install nexus-state
```

<h2></h2>

### Configuration

The library provides two separate builds:

- **ESM (import)** — full version including both `createStore` and `createReactStore`. Recommended for modern bundlers and projects.
- **CJS (require)** — minimal version exposing only the core `createStore`. The React-specific store (`createReactStore`) is intentionally excluded to keep the CommonJS build clean and framework-agnostic.

<br>

> **✦ Note:**<br>
> If you're using CommonJS, you won't have access to React bindings by default.<br>
> You can define your store as a separate configuration file (recommended) or directly inside your components.<br>
> Multiple stores are supported.

<br>

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
    user: "Anonymous",
  },

  actions: (set) => ({
    increment: () => set((prev) => ({ count: prev.count + 1 })),
    setUser: (name) => set({ user: name }),
  }),
});

export { state, actions };
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>createReactStore</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Extends <code>createStore</code> with React-specific hooks for subscribing to state in components.<br>
</em><br>
<b>Example:</b>

```js
import { createReactStore } from "nexus-state";

const { state, actions } = createReactStore({
  state: {
    count: 0,
    user: "Anonymous",
  },

  actions: (set) => ({
    increment: () => set((prev) => ({ count: prev.count + 1 })),
    setUser: (name) => set({ user: name }),
  }),
});

export { state, actions };
```

</div></ul></details>

<h2></h2>

### API

##### CORE API

<ul><div>

<details><summary><b><code>getNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
This method returns the current state object.<br>
</em><br>
<b>Example:</b>

```tsx
const currentState = state.getNexus();
console.log(currentState);
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>setNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
This method updates the state object. You can pass a partial object or a function with access to the previous state.<br>
</em><br>
<b>Example:</b>

```tsx
// Direct update:
state.setNexus({ count: 5 });

// Functional update:
state.setNexus((prev) => ({
  count: prev.count + 1,
}));
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusReset()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
This method resets the state back to its initial values.<br>
</em><br>
<b>Example:</b>

```tsx
state.nexusReset();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusSubscribe()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
This method subscribes to changes of specific keys or the entire state.<br>
</em><br>
<b>Example:</b>

```tsx
sconst unsubscribe = state.nexusSubscribe(["count"], () => {
  console.log("count changed:", state.getNexus().count);
});

// Later:
unsubscribe();
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>nexusGate()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Registers middleware to intercept state updates. You can modify or cancel the update.<br>
Useful for adding logging, debugging, or integrating with developer tools.<br>
</em><br>
<b>Example:</b><br>

```tsx
state.nexusGate((prev, next) => {
  console.log("State changing from", prev, "to", next);

  // Optionally, return a modified next state:
  // return { ...next, forced: true };
});
```

<details><summary><b>Redux DevTools Integration</b></summary><br>

```tsx
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

```tsx
// TS for Redux DevTools
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

<br>

> **✦ Note:**<br>
> Use nexusGate for middleware logic. Unlike React hooks, it runs before UI updates and doesn't trigger re-renders.

</div></ul></details>

<h2></h2>

<details><summary><b><code>actions</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
Optional actions object defined during store creation, simplifying state updates.<br>
</em><br>
<b>Example:</b>

```tsx
actions.increment();
actions.setUser("Admin");
```

</div></ul></details>

<h2></h2>

</div></ul>

##### REACT-SPECIFIC HOOKS

> **✦ Note:**<br>
> Available only in `createReactStore`

<ul><div>

<details><summary><b><code>useNexus()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
A React hook for subscribing to the store. Automatically triggers re-renders when subscribed state changes.<br>
<br>
<ul>
  <li><b>Without arguments:</b> returns the entire state object.</li>
  <li><b>With key argument:</b> subscribes to a specific key.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
const fullState = state.useNexus();
const count = state.useNexus("count");
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>useNexusSelector()</code></b></summary><br><ul><div>
<b>Description:</b> <em><br>
A React hook for creating derived values from the state.<br>
<br>
<ul>
  <li><code>selector</code>: function that returns any derived value from the state.</li>
  <li><code>dependencies</code>: array of state keys to watch for changes.</li>
</ul>
<br>
Efficient: updates only when dependencies change.<br>
</em><br>
<b>Example:</b>

```tsx
const total = state.useNexusSelector(
  (s) => s.count + s.user.length,
  ["count", "user"]
);
```

<br>

> **✦ Note:**<br>
> Memoize your selector with `useCallback` if it’s recreated often due to frequent re-renders — this prevents unnecessary re-subscriptions.

</div></ul></details>

</div></ul>

<h2></h2>

### License

[MIT](./publish/LICENSE)
