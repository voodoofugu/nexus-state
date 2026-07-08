![nexus-state logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/01-banner-logo.png)

<h2></h2>

### Table of contents

- [About](#about)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API](#api)
  - [main](#main)
  - [nexus](#nexus)
- [License](#license)

<h2></h2>

### About

Lightweight, framework-agnostic state management with optional actions, React
bindings, and traceable updates. Designed for simplicity and performance, with
first-class TypeScript inference.

**What makes it different:**

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

| Import              | Contents                                          | Needs React |
| ------------------- | ------------------------------------------------- | ----------- |
| `nexus-state`       | `createNexus`, `createActs`, `persist`, `shallow` | no          |
| `nexus-state/react` | `createReactNexus`                                | yes         |

```js
import { createNexus, createActs, persist, shallow } from "nexus-state";
import { createReactNexus } from "nexus-state/react"; // ! with /react
```

<h2></h2>

### Quick start

You can create two kinds of store — a framework-agnostic core, or a React store with hooks:

<details><summary><b>Framework-agnostic store</b> — <code>createNexus</code></summary>
<br>

```ts
import { createNexus } from "nexus-state";

const counter = createNexus({
  state: { count: 0 },
  acts: (get, set) => ({
    increment() {
      set((s) => ({ count: s.count + 1 }));
    },
  }),
});

counter.acts.increment();
counter.get("count"); // number — no generics needed, types are inferred
```

</details>

<details><summary><b>React store</b> — <code>createReactNexus</code> (from <code>nexus-state/react</code>)</summary>
<br>

```tsx
import { createReactNexus } from "nexus-state/react";

const counter = createReactNexus({
  state: { count: 0 },
  acts: (get, set) => ({
    increment() {
      set((s) => ({ count: s.count + 1 }));
    },
  }),
});

function Counter() {
  const count = counter.use("count"); // re-renders on change
  return <button onClick={counter.acts.increment}>{count}</button>;
}
```

</details>

<h2></h2>

### API

#### main:

<details><summary><code>createNexus</code> · <code>createActs</code> · <code>persist</code> · <code>shallow</code> · <code>createReactNexus</code></summary>
<br>
<ul><div>

###### **— CORE —**

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
// your-nexus-config
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
// your-nexus-config
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

<details><summary><b><code>persist</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
syncs a nexus with persistent storage. Hydration is tagged with
<code>source: "storage"</code>, and the write-back skips updates carrying that
source — so loading from disk never echoes back to disk. Returns a function that
stops persisting.<br>
The helper is named <code>persist</code> because that is the user intent. The
storage adapter itself is synchronous and string-based: it works with
<code>localStorage</code>, <code>sessionStorage</code>, or a custom object that
implements <code>getItem</code>, <code>setItem</code> and
<code>removeItem</code>.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>nexus</code>: the store to persist.</li>
  <li><code>options.key</code>: storage key.</li>
  <li><code>options.storage</code>: storage backend (defaults to <code>localStorage</code>; no-op when unavailable).</li>
  <li><code>options.include</code>: choose which keys to persist (defaults to all).</li>
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

```ts
// sessionStorage works through the same storage interface
persist(nexus, {
  key: "my-app-session",
  storage: sessionStorage,
});
```

For async loading (server, IndexedDB wrappers, files, etc.), load the data
outside of <code>persist</code> and write it with context:

```ts
const profile = await loadProfile();
nexus.set({ profile }, { source: "server" });
```

</div></ul></details>

<h2></h2>

<details><summary><b><code>shallow</code></b></summary><br><ul><div>
<b>Description:</b><em><br>
a plain one-level equality helper (not a hook, no React dependency). Compares
primitives with <code>Object.is</code>, and objects/arrays by their first-level
entries. Mainly used as the <code>isEqual</code> argument of <code>useSelector</code>,
but usable anywhere you need a cheap shallow comparison.<br>
</em><br>
<b>Example:</b>

```ts
import { shallow } from "nexus-state";

shallow([1, 2], [1, 2]); // true
shallow({ a: 1 }, { a: 2 }); // false
shallow([{ id: 1 }], [{ id: 1 }]); // false (nested refs differ)
```

</div></ul></details>

<h2></h2>

###### **— REACT —**

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
// your-nexus-config
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

</div></ul>

</details>

<h2></h2>

#### nexus:

<details><summary><code>get</code> · <code>set</code> · <code>reset</code> · <code>subscribe</code> · <code>middleware</code> · <code>acts</code> · <code>use</code> · <code>useSelector</code> · <code>useRerender</code></summary>
<br>
<ul><div>

###### **— CORE —**

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
updates the state with a partial object or a functional updater. Only keys that
actually change notify, and one <code>set</code> notifies once.<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>update</code>: partial state, or <code>(state) =&gt; partial</code>.</li>
  <li><code>context</code>: optional provenance — a string or <code>{ source, meta }</code>. Travels to middleware and subscribers.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import nexus from "your-nexus-config";

nexus.set({ count1: 5, count2: 10 }); // partial, one notification
nexus.set((state) => ({ count1: state.count1 + 1 })); // functional

nexus.set({ user }, "server"); // provenance shortcut for { source: "server" }
nexus.set({ user }, { source: "server", meta: { requestId: 7 } });
```

<br>

> ✦ Sources: known values (`"manual" | "storage" | "server" | "external" | "reset"`) autocomplete, but any string works.<br>
> ✦ Batching: one <code>set</code> with several keys notifies once — the primary way to batch. <code>set</code> calls made synchronously inside an action are collapsed into one too.

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
  <li><code>dependencies</code>: keys to watch (required, so every subscription is explicit). Pass specific keys, or <code>["*"]</code> to watch every key.</li>
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

// Watch every key:
nexus.subscribe((state) => save(state), ["*"]);

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

// later: remove() to detach middleware
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

<b>Important:</b><em><br>
regular functions support calling other actions via <code>this</code>, arrow functions are more compact but don't:
</em><br>

```js
// regular function
increment() {
  this.getState("count1"); // works
}

// arrow function
increment: () => this.getState("count1"); // not works
```

More info: [Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

</div></ul></details>

<h2></h2>

###### **— REACT —**

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
<code>react</code> hook that derives a value from state. It re-renders only when
the selector's <b>result</b> changes (<code>Object.is</code> by default).<br>
</em><br>
<b>Parameters:</b><em><br>
<ul>
  <li><code>selector</code>: derives a value from the state.</li>
  <li><code>dependencies</code>: keys that trigger a re-check (required). Pass specific keys, or <code>["*"]</code> to watch every key.</li>
  <li><code>isEqual</code>: optional result comparator. Defaults to <code>Object.is</code>; pass <code>shallow</code> for one-level object/array equality, or your own.</li>
</ul>
</em><br>
<b>Example:</b>

```tsx
import { shallow } from "nexus-state";
import nexus from "your-nexus-config";

// Primitive result — Object.is is enough:
const total = nexus.useSelector((s) => s.count1 + s.count2, ["count1", "count2"]);

// New array/object each run (.map/.filter/literal) — pass shallow so an
// equal result doesn't re-render:
const ids = nexus.useSelector((s) => s.items.map((i) => i.id), ["items"], shallow);

// Escape hatch — custom comparator (e.g. arrays of objects):
const rows = nexus.useSelector(
  (s) => s.users.map((u) => ({ id: u.id, name: u.name })),
  ["users"],
  (a, b) => a.length === b.length && a.every((x, i) => x.id === b[i].id),
);
```

<br>

> ✦ Note: comparison is on the selector's <b>result</b>, not the watched keys — a watched key re-runs the selector, but an equal result won't re-render. <code>shallow</code> is a plain helper (not a hook), and the selector/comparator are read from refs, so no <code>useCallback</code> is needed.

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

</details>

<h2></h2>

### License

[MIT](./LICENSE)
