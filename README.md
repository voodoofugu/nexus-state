![logo](https://raw.githubusercontent.com/voodoofugu/nexus-state/refs/heads/main/src/assets/01-banner-logo.jpg?token=GHSAT0AAAAAADFZRJIDC7XM47QMZITKTUXQ2D6B55A)

<h2></h2>

### Table of contents

- [About](#About)
- [Basic Usage](#Basic-Usage)
- [License](#License)
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

### Basic Usage

#### Core Store ( _createStore_ )

Nexus State Core Store is a minimal, framework-agnostic state management solution. You can use it either by creating a separate configuration file (recommended) or directly within your components.

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

##### API Methods

  <details>
    <summary><b><code>getNexus()</code></b>: <em>Returns the current state object.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method returns the current state object.<br />
      <br />
      <b>Example:</b>

      ```tsx
      const currentState = state.getNexus();
      console.log(currentState);
      ```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>setNexus()</code></b>: <em>Updates the state object.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method updates the state object. You can pass a partial object or a function with access to the previous state.<br />
      <br />
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
    <summary><b><code>nexusReset()</code></b>: <em>Resets the state.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method resets the state back to its initial values.<br />
      <br />
      <b>Example:</b>

      ```tsx
      state.nexusReset();
      ```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>nexusSubscribe()</code></b>: <em>Subscribes to changes.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      This method subscribes to changes of specific keys or the entire state.<br />
      <br />
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
    <summary><b><code>nexusGate()</code></b>: <em>Middleware for subscriptions.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      Registers middleware to intercept state updates. You can modify or cancel the update.<br />
      <br />
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
    <summary><b><code>actions</code></b>: <em>Optional actions object.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      Optional actions object defined during store creation, simplifying state updates.<br />
      You can define as many actions as needed.<br />
      <br />
      <b>Example:</b>

      ```tsx
      actions.increment();
      actions.setUser("Admin");
      ```

  </ul></details>

  <h2></h2>

#### React Store ( _createReactStore_ )

The React Store builds on top of the Core Store, providing React-specific bindings for state management via React hooks. This makes it easy to integrate reactive state directly into your React components while still keeping access to the full core API.

You can structure your store as a configuration file (recommended) or define it inline within components. Like the core version, you're not limited to a single store instance.

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

##### React-Specific Methods

  <details>
    <summary><b><code>useNexus()</code></b>: <em>A React hook for subscribing to state changes.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      A React hook for subscribing to the store. Automatically triggers re-renders when subscribed state changes.<br />
      <ul>
        <li><b>Without arguments:</b> returns the entire state object.</li>
        <li><b>With key argument:</b> subscribes to a specific key.</li>
      </ul>
      <br />
      <b>Example:</b>

      ```tsx
      const fullState = state.useNexus();
      const count = state.useNexus("count");
      ```

  </ul></details>

  <h2></h2>

  <details>
    <summary><b><code>useNexusSelector()</code></b>: <em>A React hook for creating derived values from the state.</em></summary><br />
    <ul>
      <b>Description:</b> <em><br />
      A React hook for creating derived values from the state.<br />
      <ul>
        <li><code>selector</code>: function that returns any derived value from the state.</li>
        <li><code>dependencies</code>: array of state keys to watch for changes.</li>
      </ul>
      Efficient: updates only when dependencies change.<br />
      <br />
      <b>Example:</b>

      ```tsx
      const total = state.useNexusSelector(
        (s) => s.count + s.user.length,
        ["count", "user"]
      );
      ```

  </ul></details>

  <h2></h2>

##### Access to Core API

Besides React-specific hooks, the full Core Store API is available:

- `state.getNexus()`
- `state.setNexus()`
- `state.nexusReset()`
- `state.nexusSubscribe()`
- `state.nexusGate()`

### License

MIT

<h2></h2>

### API

- `NexusProvider`: Provider Component to wrap your application.
- `useNexus`: Hook for accessing a state by key.
