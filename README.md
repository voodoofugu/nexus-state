![logo](https://raw.githubusercontent.com/voodoofugu/nexus-state/refs/heads/main/src/assets/01-banner-logo.jpg)

<h2></h2>

### Table of contents

- [About](#About)
- [Installation](#Installation)
- [Configuration](#Configuration)
- [API](#API)

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

<ul>

#### createStore

`createStore` is configurable either by creating a separate configuration file (recommended) or directly within your components.

You are not limited to a single store instance — create as many as your project needs.

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

  <h2></h2>

#### createReactStore

The `createReactStore` builds on top of the `createStore`, providing React-specific bindings for state management via React hooks. This makes it easy to integrate reactive state directly into your React components while still keeping access to the full core API.

```js
import { createReactStore } from "nexus-state";

const { state, actions } = createReactStore({
  state: {
    count: 0,
    user: "Anonymous",
  },
  actions: (set) => ({
    increment: () => set((prev) => ({ count: prev.count + 1 })),
  }),
});

export { state, actions };
```

</ul>

<h2></h2>

### API Methods

  <details>
    <summary><b><code>getNexus()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method returns the current state object.<br />
      </em><br />
      <b>Example:</b>

```tsx
const currentState = state.getNexus();
console.log(currentState);
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>setNexus()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method updates the state object. You can pass a partial object or a function with access to the previous state.<br />
      </em><br />
      <b>Example:</b>

```tsx
// Direct update:
state.setNexus({ count: 5 });

// Functional update:
state.setNexus((prev) => ({
  count: prev.count + 1,
}));
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>nexusReset()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method resets the state back to its initial values.<br />
      </em><br />
      <b>Example:</b>

```tsx
state.nexusReset();
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>nexusSubscribe()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method subscribes to changes of specific keys or the entire state.<br />
      </em><br />
      <b>Example:</b>

```tsx
sconst unsubscribe = state.nexusSubscribe(["count"], () => {
  console.log("count changed:", state.getNexus().count);
});

// Later, to unsubscribe:
unsubscribe();
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>nexusGate()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      Registers middleware to intercept state updates. You can modify or cancel the update.<br />
      </em><br />
      <b>Example:</b>

```tsx
state.nexusGate((prev, next) => {
  console.log("State changing from", prev, "to", next);

  // Optionally, return a modified next state:
  // return { ...next, forced: true };
});
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>actions</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      Optional actions object defined during store creation, simplifying state updates.<br />
      You can define as many actions as needed.<br />
      </em><br />
      <b>Example:</b>

```tsx
actions.increment();
actions.setUser("Admin");
```

  </ul></details>

  <h2></h2>

##### React-Specific Methods

  <details>
    <summary><b><code>useNexus()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      A React hook for subscribing to the store. Automatically triggers re-renders when subscribed state changes.<br />
      <br />
      <ul>
        <li><b>Without arguments:</b> returns the entire state object.</li>
        <li><b>With key argument:</b> subscribes to a specific key.</li>
      </ul>
      </em><br />
      <b>Example:</b>

```tsx
const fullState = state.useNexus();
const count = state.useNexus("count");
```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>useNexusSelector()</code></b></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      A React hook for creating derived values from the state.<br />
      <br />
      <ul>
        <li><code>selector</code>: function that returns any derived value from the state.</li>
        <li><code>dependencies</code>: array of state keys to watch for changes.</li>
      </ul>
      <br />
      Efficient: updates only when dependencies change.<br />
      </em><br />
      <b>Example:</b>

```tsx
const total = state.useNexusSelector(
  (s) => s.count + s.user.length,
  ["count", "user"]
);
```

  </ul></details>

<h2></h2>

### API

- `createStore`: Creates a new store instance.
- `createReactStore`: Creates a new React store instance.
