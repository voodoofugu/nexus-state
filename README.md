![nexus-state logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/01-banner-logo.png)

<h2></h2>

### Table of contents

- [About](#about)
- [What makes it different](#what-makes-it-different)
- [Installation](#installation)
- [Entry points](#entry-points)
- [Quick start](#quick-start)
- [API](#api)
  - [main](#main)
  - [nexus](#nexus)
  - [persist](#persist)
- [License](#license)

<h2></h2>

### About

Lightweight, framework-agnostic state management with optional actions, React
bindings, and traceable updates. Designed for simplicity and performance, with
first-class TypeScript inference.

<h2></h2>

### What makes it different

- **Traceable state.** Every update carries a `context` describing where it came
  from (`"server"`, `"storage"`, `"reset"`, or your own). That context flows
  through both middleware **and** subscribers — so persistence, sync, and
  devtools can tell a user action from a hydration without guessing.
- **Key-level subscriptions.** Subscribers listen to specific keys, so an update
  only notifies what actually depends on it — no selector is re-run for
  components that didn't change.
- **Optional React.** The core has zero dependencies and no React. Persistence is
  available from the main entry point; React hooks live behind a separate entry
  point you opt into.
- **Inference-first types.** State and actions are inferred from your config —
  you rarely write a generic by hand.

<h2></h2>

### Installation

```bash
npm install nexus-state
```

React is an **optional** peer dependency — only needed if you import
`nexus-state/react`.

<h2></h2>

### Entry points

| Import                | Contents                               | Needs React |
| --------------------- | -------------------------------------- | ----------- |
| `nexus-state`         | `createNexus`, `createActs`, `persist` | no          |
| `nexus-state/react`   | `createReactNexus` (+ core re-exports) | yes         |
| `nexus-state/persist` | direct `persist` entry                 | no          |

```js
import { createNexus, createActs, persist } from "nexus-state";
import { createReactNexus } from "nexus-state/react";
```

<h2></h2>

### Quick start

```tsx
import { createReactNexus } from "nexus-state";
// ✦ note: createReactNexus is served from "nexus-state/react"

const nexus = createReactNexus({
  state: { count: 0 },
  acts: (get, set) => ({
    increment() {
      set((s) => ({ count: s.count + 1 }));
    },
  }),
});

function Counter() {
  const count = nexus.use("count");
  return <button onClick={nexus.acts.increment}>{count}</button>;
}
```

No generics required — `count` is `number` and `nexus.acts.increment` is fully
typed, inferred from the config.

<h2></h2>

### API

#### main:

<ul><div>
<details><summary><b><code>createNexus</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
creates a new framework-agnostic store (**nexus**) instance.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and optional <code>acts</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createNexus } from "nexus-state";

const nexus = createNexus({
  state: {
    count1: 0,
    count2: 0,
  },

  acts: (get, set) => ({
    increment() {
      set((state) => ({ count1: state.count1 + 1 }));
      this.getState("count1"); // ! calling another action
    },
    getState(value) {
      console.log(`${value}:`, get(value));
    },
  }),
});

export default nexus;
```

<details><summary><b>TypeScript Snippet:</b></summary>

State and action types are inferred from your config, so most stores need no
generics:

```ts
const nexus = createNexus({
  state: { count: 0 },
  acts: (get, set) => ({
    inc() {
      set((s) => ({ count: s.count + 1 }));
    },
  }),
});

nexus.get("count"); // number
nexus.acts.inc(); // () => void
```

Pass generics explicitly only when you want to declare the shape up front:

```ts
createNexus<MyState, MyActions>({ ... });
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createReactNexus</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
extends <code>createNexus</code> with React-specific hooks.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>options</code>: object with <code>state</code> and optional <code>acts</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createReactNexus } from "nexus-state/react"; // import with /react

const nexus = createReactNexus({
  state: {
    count1: 0,
    count2: 0,
  },

  acts: (get, set) => ({
    increment() {
      set((state) => ({ count1: state.count1 + 1 }));
      this.getState("count1"); // ! calling another action
    },
    getState(value) {
      console.log(`${value}:`, get(value));
    },
  }),
});

export default nexus;
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
// The acts generic is optional — omitting it no longer causes an error.
const nexus = createReactNexus({ state: {...}, acts: (get, set) => ({...}) });

// Explicit form, if you prefer to declare shapes:
const typed = createReactNexus<MyState, MyActions>({...});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary><b><code>createActs</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
creates a reusable action slice — useful for code splitting. Pass one slice
directly to <code>acts</code>, or pass several slices as an array.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>create</code>: function that receives <code>get</code> and <code>set</code>, with <code>this</code> bound to the full acts object.</li>
</ul>
</em><br>
<b>Example:</b>

```js
import { createNexus, createActs } from "nexus-state";

const counterActs = createActs((get, set) => ({
  increment() {
    set((state) => ({ count1: state.count1 + 1 }));
    this.getState("count1"); // ! calling another action inside
  },
  getState(value) {
    console.log(`${value}:`, get(value));
  },
}));

const nexus = createNexus({
  state: {...},
  acts: counterActs, // ! supports multiple too: [counterActs, otherActs]
});

export default nexus;
```

<details><summary><b>TypeScript Snippet:</b></summary>

```ts
type MyState = {...};
type MyActions = {...};

// `this` is typed as the complete acts object across every slice,
// so cross-slice calls are fully typed — no optional chaining needed.
const counterActs = createActs<MyState, MyActions>(function (get, set) {
  return {
    increment() {
      this.getState("count1"); // typed
    },
  };
});
```

</details>

</div></ul></details>

<h2></h2>

<details><summary>Recommendations:</summary><br><ul><div>
The nexus name is arbitrary, which can be helpful when working with multiple nexus instances:<br>

```js
import { createNexus } from "nexus-state";

const nexus1 = createNexus({...});
const nexus2 = createNexus({...});
```

</div></ul></details>

<h2></h2>

#### nexus:

<ul><div>

<h6><mark>core</mark></h6>

<details><summary><b><code>get</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
returns the entire state or a specific state value. Does not subscribe.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

const entireState = nexus.get();
const specificValue = nexus.get("key");
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>set</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
updates the state with a partial object or functional updater. Only the keys
that actually change trigger a notification.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>update</code>: partial object or function with access to all states.</li>
  <li><code>context</code>: optional string, or object with <code>source</code> and optional <code>meta</code>. Travels to middleware and subscribers.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

// Direct update:
nexus.set({ count1: 5 });
nexus.set({ count1: 5, count2: 10 }); // multiple keys, one notification

// Functional update:
nexus.set((state) => ({
  count1: state.count1 + 1,
}));

// With context (provenance) — visible to middleware and subscribers:
nexus.set({ key: newValue }, { source: "server", meta: { requestId: 7 } });

// Shortcut equivalent to { source: "server" }:
nexus.set({ key: newValue }, "server");
```

<br>

> ✦ Note:<br>
> Known sources (`"manual" | "storage" | "server" | "external" | "reset"`) are
> autocompleted, but **any** string is allowed.

<br>

> ✦ Batching:<br>
> A single <code>set</code> call notifies subscribers once, even when several
> keys change. Multiple <code>set</code> calls inside one action are also
> batched and notify once after the action finishes.

</div></ul></details>

<h2></h2>

<details><summary><b><code>reset</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
resets the entire state or specific keys to their initial values. Runs through
middleware and subscribers with <code>{ source: "reset" }</code>.<br>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

nexus.reset(); // reset entire state
nexus.reset("count1", "count2"); // reset specific keys
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>subscribe</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
subscribes to changes of specific keys (or the entire state) and returns an
unsubscribe function. The observer receives the current state and the update
context.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>observer</code>: <code>(state, context?) =&gt; void</code>, called when a watched key changes.</li>
  <li><code>dependencies</code>: keys to watch. Use <code>["*"]</code> for all. Defaults to <code>["*"]</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

const unsubscribe = nexus.subscribe(
  (state, context) => {
    console.log("count1 changed:", state.count1, "from", context?.source);
  },
  ["count1"],
);

// A subscriber watching several keys is notified once per update, not per key.
nexus.subscribe((state) => save(state), ["count1", "count2"]);

// later: unsubscribe() to disable subscribing
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>middleware</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
registers a middleware to intercept and optionally modify updates. Returns a
function that removes it.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>fn</code>: <code>(prev, next, context?) =&gt; next | void</code>. Return a new state to replace it, or nothing for a side effect only.</li>
</ul>
</em><br>
<b>Example:</b><br>

```jsx
import nexus from "your-nexus-config";

const remove = nexus.middleware((prev, next, context) => {
  if (context?.source === "storage") {
    console.log("Loaded from storage:", next);
  }
  // Return a modified state, or nothing for a pure side effect.
  return next;
});

remove(); // detach the middleware
```

<details><summary><b>Redux DevTools Integration</b></summary><br><ul><div>
<b>Description:</b><em><br>
you can connect your nexus to Redux DevTools for time-travel debugging and state inspection.<br>
</em><br>
<b>Example:</b><br>

```tsx
import nexus from "your-nexus-config";

const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "MyStore",
});

devtools?.init(nexus.get());

nexus.middleware((_, next, context) => {
  devtools?.send?.({ type: context?.source ?? "UPDATE" }, next);
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
object containing your custom actions.<br>
</em><br>
<b>Usage Example:</b>

```tsx
import nexus from "your-nexus-config";

nexus.acts.increment();
nexus.acts.getState("count1");
```

<br>
<b>Important:</b><em><br>
regular functions support calling other actions via <code>this</code>; arrow
functions are more compact but don't:
</em><br>

<br>

```js
// regular function
increment() {
  this.getState("count1"); // works
}

// arrow function
increment: () => this.getState("count1"); // `this` is not the acts object
```

More info: [Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

</div></ul></details>

<h2></h2>

<h6><mark>react</mark></h6>

<details><summary><b><code>use</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook to subscribe to the entire state or a single value.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>key</code>: optional state name.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

const entireState = nexus.use();
const specificValue = nexus.use("key");
```

<br>

> ✦ Note:<br>
> Unlike **get**, **use** triggers a re-render when the watched state changes.

</div></ul></details>

<h2></h2>

<details><summary><b><code>useSelector</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook for deriving a value from the state. The component
re-renders only when the derived value changes.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>selector</code>: function returning any derived value from the state.</li>
  <li><code>dependencies</code>: keys to watch. Use <code>["*"]</code> for all. Defaults to <code>["*"]</code>.</li>
  <li><code>isEqual</code>: optional comparator for the derived value (e.g. shallow equality). Defaults to <code>Object.is</code>.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

const total = nexus.useSelector(
  (state) => state.count1 + state.count2,
  ["count1", "count2"],
);

// Custom equality for object/array results:
const items = nexus.useSelector(
  (state) => state.items,
  ["items"],
  (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
);
```

<br>

> ✦ Note:<br>
> The selector is read from a ref internally, so you **don't** need
> `useCallback` to keep the subscription stable.

</div></ul></details>

<h2></h2>

<details><summary><b><code>useRerender</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
<code>react</code> hook that returns a function to force a re-render.<br>
Useful for updating refs or non-reactive values.<br>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

const rerender = nexus.useRerender();
rerender(); // force re-render
```

</div></ul></details>

</div></ul>

<h2></h2>

#### persist:

<ul><div>
<details><summary><b><code>persist</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
syncs a nexus with persistent storage. Hydration is tagged with
<code>source: "storage"</code>, and the write-back skips updates carrying that
source — so loading from disk never echoes back to disk. Returns a function that
stops persisting.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>nexus</code>: the store to persist.</li>
  <li><code>options.key</code>: storage key.</li>
  <li><code>options.storage</code>: storage backend (defaults to <code>localStorage</code>; no-op when unavailable).</li>
  <li><code>options.include</code> / <code>options.exclude</code>: choose which keys to persist.</li>
  <li><code>options.version</code> + <code>options.migrate</code>: migrate older snapshots.</li>
  <li><code>options.onError</code>: handle storage / parse errors instead of throwing.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { createNexus, persist } from "nexus-state";

const nexus = createNexus({ state: { theme: "light", count: 0 } });

const stop = persist(nexus, {
  key: "my-app",
  include: ["theme"], // persist only the theme
  version: 1,
  migrate: (old) => ({ theme: old.theme ?? "light" }),
});

// later: stop() to disable persistence
```

</div></ul></details>
</div></ul>

<h2></h2>

### License

[MIT](./LICENSE)
