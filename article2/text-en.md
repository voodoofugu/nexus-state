# Manual Render Invalidation: A Deliberate React Anti-Pattern

While developing the [morphing-scroll](https://www.npmjs.com/package/morphing-scroll) library, I arrived at an unusual way of organizing local data inside a React component. It was not an architecture I had designed in advance. I was experimenting with updates, gradually removing unnecessary state, and at some point the code became noticeably simpler than before. For me, it was a genuine discovery.

Later, I extracted the mechanism into a `useRerender` hook and added it to my state manager, [nexus-state](https://www.npmjs.com/package/nexus-state). In this article, I want to show not only the result, but also the path that led me to it.

The idea is to separate two operations that `useState` usually combines:

1. change the data;
2. tell React that the UI needs to update.

The data can live in refs and be changed synchronously, while a single shared signal is used to update the UI. This goes against the conventional React model and is not suitable for every component. That is exactly why it is interesting to explore where such an anti-pattern can become a useful tool.

Throughout this article, I will call this approach **manual render invalidation**. The data changes independently of React, and the developer explicitly signals when the current view should be considered stale and rebuilt. I coined this name for the article; it is not an established React term.

## From a Regular Counter to Redundant State

Let us start with a regular counter:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Clicks: {count}
    </button>
  );
}
```

Here, `useState` is exactly the right tool. The value is used during rendering, and every change should update the button text. This code is familiar to almost every React developer, and there is nothing unusual about it yet.

Now let us place the counter inside a product card. In addition to quantity, we need a selected product and a total price. We will deliberately write the first version in the most straightforward way: one `useState` for every changing value.

```jsx
const products = {
  keyboard: { name: "Keyboard", price: 80 },
  mouse: { name: "Mouse", price: 40 },
  display: { name: "Monitor", price: 350 },
};

function ProductCard() {
  const [productId, setProductId] = useState("keyboard");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(products.keyboard.price);

  function changeProduct(nextProductId) {
    setProductId(nextProductId);
    setTotal(products[nextProductId].price * quantity);
  }

  function changeQuantity(nextQuantity) {
    setQuantity(nextQuantity);
    setTotal(products[productId].price * nextQuantity);
  }

  return (
    <section>
      <select
        value={productId}
        onChange={(event) => changeProduct(event.target.value)}
      >
        <option value="keyboard">Keyboard</option>
        <option value="mouse">Mouse</option>
        <option value="display">Monitor</option>
      </select>

      <button onClick={() => changeQuantity(Math.max(1, quantity - 1))}>
        −
      </button>
      <span>{quantity}</span>
      <button onClick={() => changeQuantity(quantity + 1)}>+</button>

      <p>Total: ${total.toLocaleString("en-US")}</p>
    </section>
  );
}
```

The code works, but a review reveals an uncomfortable dependency. Every product or quantity change must also call `setTotal`. If another way to change the quantity appears later, the total can easily fall out of sync with the rest of the data.

`total` has no independent source. It is always the selected product's price multiplied by the quantity, so there is no reason to store it:

```jsx
function ProductCard() {
  const [productId, setProductId] = useState("keyboard");
  const [quantity, setQuantity] = useState(1);

  const product = products[productId];
  const total = product.price * quantity;

  // The rest of the markup stays the same
}
```

This removes `setTotal`, both manual synchronization points, and the possibility of contradictory state. React also [recommends avoiding redundant state](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state).

At first, this looked like an ordinary cleanup: find redundant state, replace it with a calculation, and reduce the number of values that need synchronization. But the refactoring raised a broader question.

If one value does not need to be React state because it can be calculated, where is the actual boundary? Does React have to store the remaining data merely because it sometimes appears in JSX? Can we change it ourselves and ask React to render only when the result is ready to be shown?

In React, it is easy to start associating every change with `useState`. As a result, new state often appears automatically, before we even ask whether React should own that value.

This is where I began to wonder: what if I removed every `useState`, stored the data myself, and kept only one shared update mechanism?

The product-card example is deliberately simple. In practice, this approach helped me while developing a complex React component built around scrolling.

## The Turning Point in morphing-scroll

`morphing-scroll` had a different problem. The component manages scrolling, virtualization, dragging, inertia, and its own controls. To do that, it needs:

- the current and target scroll positions;
- viewport and content dimensions;
- the visible item range;
- the movement direction;
- dragging and animation state;
- identifiers of scheduled frames.

The first obvious solution looks like this:

```jsx
const [scrollTop, setScrollTop] = useState(0);
const [targetScrollTop, setTargetScrollTop] = useState(0);
const [viewportHeight, setViewportHeight] = useState(0);
const [visibleRange, setVisibleRange] = useState([0, 20]);
const [isDragging, setIsDragging] = useState(false);
const [isScrolling, setIsScrolling] = useState(false);
```

The number of hooks alone does not explain the problem. Complexity appears when there are many state values and relationships emerge between them. A single `scroll` event changes the position, direction, and visible range. Starting a drag switches several flags. On every frame, the animation needs to read fresh data, calculate the next values, and sometimes update the JSX.

A setter also does not change the value inside the handler that is currently running:

```jsx
function handleScroll(nextScrollTop) {
  setScrollTop(nextScrollTop);

  console.log(scrollTop); // value from the current render
}
```

This is how React state works: every render receives its own snapshot, and the setter queues the next one. That is a useful guarantee for a declarative interface. Inside the scrolling algorithm, however, I needed synchronously mutable data that handlers could access immediately. Several independent setters made the order of calculations harder to reason about.

React [batches multiple state updates](https://react.dev/learn/queueing-a-series-of-state-updates) into a single render. But batching only answers how many renders will happen. It does not separate changing the data from requesting a UI update: every setter still does both.

### Why Not useReducer?

Related state can be grouped in `useReducer`. This removes multiple setters, leaves a single `dispatch`, and is the more conventional solution for most components.

However, a reducer preserves React's underlying model: `dispatch` queues a new state snapshot and requests a render along with it. I needed something different in `morphing-scroll`. The internal model had to change synchronously, sometimes several times between frames, while React should only become involved when the accumulated result was ready to be displayed.

The issue was therefore not only the number of setters. I needed to separate changing the data from publishing those changes to the interface.

### A Ref as the Component's Internal Model

I grouped the related values into a single object inside `useRef`:

```jsx
const runtimeRef = useRef({
  scrollTop: 0,
  targetScrollTop: 0,
  viewportHeight: 0,
  rowHeight: 40,
  visibleRange: [0, 20],
  isDragging: false,
  isScrolling: false,
});
```

Now the handler can finish every calculation synchronously:

```jsx
function handleScroll(element) {
  const runtime = runtimeRef.current;

  runtime.scrollTop = element.scrollTop;
  runtime.viewportHeight = element.clientHeight;
  runtime.visibleRange = calculateVisibleRange(
    runtime.scrollTop,
    runtime.viewportHeight,
    runtime.rowHeight,
  );
  runtime.isScrolling = true;
}
```

Each line immediately sees the result of the previous one. There are no separate setters, and there is no need to remember which render snapshot a value belongs to.

One problem remains: changing `ref.current` does not trigger a render. React does not know that it should read `visibleRange` again.

### useRerender as a Separate Signal

A function component can request another render through dummy state:

```jsx
import { useReducer } from "react";

function useRerender() {
  const [, rerender] = useReducer((version) => version + 1, 0);

  return rerender;
}
```

The `version` value is never used. Its only purpose is to make React start another render of the component.

Now several changes can end with one explicit `rerender`:

```jsx
const rerender = useRerender();

function handleScroll(element) {
  const runtime = runtimeRef.current;

  runtime.scrollTop = element.scrollTop;
  runtime.viewportHeight = element.clientHeight;
  runtime.visibleRange = calculateVisibleRange(
    runtime.scrollTop,
    runtime.viewportHeight,
    runtime.rowHeight,
  );

  rerender(); // explicitly update the UI at the end
}
```

This was the turning point for me. Until then, I had treated changing data and rendering as one operation: state changed, so React should start an update. It turned out that the two can be separated. First bring the internal model into a consistent state, then publish the result with a single signal.

> Change the data first. Then decide when React should display it.

The code unexpectedly became easier to understand. Instead of a large collection of `value/setValue` pairs, I had a regular object and one shared `rerender`. I no longer had to remember a separate setter name for every field or the order of several queued updates. Multiple mutations became a single, explicitly marked update boundary.

This, rather than the three lines inside `useRerender`, was the key result of the experiment. The component became responsible for the timing of the update: it decides which changes should be included in the next render.

This style is much closer to ordinary imperative JavaScript. We change the required data synchronously and involve React only when we want to display its current version in the UI.

### One Render per Frame

`scroll` and `pointermove` events may fire several times between two browser paints. In that case, the signal can be limited to one call per frame:

```jsx
const frameRef = useRef(null);
const rerender = useRerender();

function renderInNextFrame() {
  if (frameRef.current !== null) return;

  frameRef.current = requestAnimationFrame(() => {
    frameRef.current = null;
    rerender();
  });
}

function handleScroll(event) {
  const runtime = runtimeRef.current;

  runtime.scrollTop = event.currentTarget.scrollTop;
  runtime.visibleRange = calculateVisibleRange(
    runtime.scrollTop,
    runtime.viewportHeight,
    runtime.rowHeight,
  );

  renderInNextFrame();
}
```

If five events occur between frames, the ref retains the result of the last one, while React receives only one render request. This is not automatic batching. It is an update boundary defined by the component itself. A scheduled `requestAnimationFrame` should also be cancelled when the component unmounts.

For `morphing-scroll`, this became the main advantage: the rate at which the internal data changes no longer has to match React's render rate. It also helped performance because the component did not request more renders than the browser could actually paint.

## What Do We Give Up?

React treats refs as an escape hatch. The [documentation](https://react.dev/learn/referencing-values-with-refs) recommends using them for values that do not participate in JSX and warns against reading `ref.current` during rendering. Manual invalidation deliberately crosses that boundary: JSX reads data from a ref, and `useRerender` makes React read it again.

This comes with limitations:

1. If you forget to call `rerender`, the data changes but the interface remains stale. React no longer manages that connection for you.
2. Reading a mutable ref during rendering goes beyond React's standard contract. This code works through explicit invalidation, but the linter and newer React features rely on a different contract: rendering should be determined by props, state, and context.
3. A stable reference requires extra care with memoization. `React.memo`, `useMemo`, and reference equality checks do not notice mutations inside the object. It is safer to pass specific values or a separate update version to child components.
4. Ref changes do not appear in React DevTools as regular state updates, which makes them harder to trace while debugging.

Effects have an additional caveat. `ref.current` is not reactive by itself. However, after changing it we call `rerender`, so during the next render React still compares the new dependency value with the previous one:

```jsx
useEffect(() => {
  doSomething(runtimeRef.current.scrollTop);
}, [runtimeRef.current.scrollTop]); // reevaluated in the render triggered by rerender()
```

This works specifically because of `useRerender`: it starts a render in which the dependency expression is evaluated again, and React [compares the result using `Object.is`](https://react.dev/reference/react/useEffect#parameters). If the ref changes without `rerender`, the effect never learns about it.

`exhaustive-deps` may warn that a mutable value is not a valid reactive dependency. A modern `eslint-plugin-react-hooks` configuration may also enable the [`refs`](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) rule because the dependency is read during rendering. These warnings are correct for conventional React code: mutating a ref does not trigger a render. With manual invalidation, `useRerender` supplies the missing step, but the linter cannot infer that contract from the code. A local suppression becomes another explicit cost of the anti-pattern.

Such an effect reacts only to values that reach a render, not to every ref mutation. Its callback also reads `runtimeRef.current.scrollTop` when the effect actually runs, so it may see a newer value than the one React compared in the dependency array. If every mutation or the exact snapshot of a particular update matters, invoke the side effect next to the data change or use a fully reactive source instead.

## Rewriting the Product Card with the Anti-Pattern

At the beginning of the article, we removed only the derived `total`, while `productId` and `quantity` remained in React state. For the sake of the experiment, let us take the idea all the way and rewrite the card without a single `useState`. The `products` object containing names and prices remains the same one declared outside the component in the first example.

```jsx
function ProductCard() {
  const rerender = useRerender();

  const modelRef = useRef({
    productId: "keyboard",
    quantity: 1,
  });

  const model = modelRef.current;
  const total = products[model.productId].price * model.quantity;

  return (
    <section>
      <select
        value={model.productId}
        onChange={(event) => {
          model.productId = event.target.value;
          rerender();
        }}
      >
        <option value="keyboard">Keyboard</option>
        <option value="mouse">Mouse</option>
        <option value="display">Monitor</option>
      </select>

      <button
        onClick={() => {
          model.quantity = Math.max(1, model.quantity - 1);
          rerender();
        }}
      >
        −
      </button>

      <span>{model.quantity}</span>

      <button
        onClick={() => {
          model.quantity += 1;
          rerender();
        }}
      >
        +
      </button>

      <p>Total: ${total.toLocaleString("en-US")}</p>
    </section>
  );
}
```

`model.productId` stores the key of the selected product, for example `"keyboard"`. The expression `products[model.productId]` finds the product in the catalog by that key, after which its price is multiplied by the quantity.

`total` remains a regular constant because it is calculated from the source data during every render. Moving it into another ref would bring no meaningful benefit and would reintroduce the manual synchronization that we removed at the beginning of the article.

The code is straightforward: data changes through regular assignments, and every field shares the same `rerender`. Before calling it, we can change one field or several at once.

## Where Is This Approach Most Useful?

I would consider refs together with `useRerender` for components that have their own imperative model:

- virtualized lists and complex scrolling;
- drag and drop;
- canvas and WebGL;
- animation loops;
- high-frequency pointer events;
- DOM measurements and synchronization with browser APIs.

The advantage is most noticeable when data changes more often than JSX should update, or when several values need to change consistently before a render. Another reason to consider the approach is a large amount of local state in one component. Every new `value/setValue` pair adds another name and another update path that must be kept in mind. If that makes the code harder to read and control, one data object and a shared `rerender` can noticeably reduce the cognitive load.

There is no universal number of `useState` calls after which a component must be rewritten. What matters is the practical result: which model describes the component more accurately, and which one makes data changes easier to follow.

## How Original Is This Technique?

I arrived at this solution independently while working on `morphing-scroll`. I was not searching for an existing pattern or trying to reproduce someone else's implementation. The idea emerged from experiments with a real component and immediately proved useful in practice. That is why the moment it worked felt like a revelation.

At the same time, the individual parts of the approach existed before. The old [React Hooks FAQ](https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate) demonstrates an almost identical `useReducer` counter, and various libraries provide hooks named `useForceUpdate`, `useUpdate`, or `useRerender`. The mechanism for forcing a render is not new.

There are also closer architectural parallels. [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) separates an external data source from the signal sent to subscribers. [MobX](https://mobx.js.org/react-integration.html) and [Valtio](https://github.com/pmndrs/valtio) let a model change independently of React while automatically tracking which components need to update. In [React Three Fiber](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx#triggering-manual-frames), imperative changes can be followed by `invalidate()` to request another frame. The last example is especially close to how this approach works with scrolling and `requestAnimationFrame`.

However, among the examples I found, I did not see an ordinary local React component described in exactly this way: refs serve as a complete model, while one `rerender` becomes an explicit publication boundary. Similar code may have been written before, but I am not claiming to have invented the hook. What matters to me is the independently discovered way of organizing the component around it.

The name "manual render invalidation" describes this complete model. If the current data already lives outside React state, there is no reason to present a technical render counter as domain state. Its actual job is to mark the current view as stale and ask React to build a new one.

That is why I added this primitive to `nexus-state`:

```jsx
const rerender = nexus.useRerender();

runtimeRef.current.value = nextValue;
rerender();
```

## Conclusion

The path to `useRerender` did not begin with a desire to invent a new hook. While developing `morphing-scroll`, working with many related state values became so confusing that I started removing unnecessary `useState` calls one by one. As a result, most of the runtime data moved into refs, while a separate `useRerender` hook remained solely as a signal telling React to render the current model.

This experience changed how I think about `useState`. It is not merely a container with a `value/setValue` pair, but a contract with React: React stores a snapshot of the data and decides when to show the next one. If a component accumulates so many state variables that navigating their values and setters becomes difficult, that is already a valid reason to consider another model. This is especially true when the values are related, need to change synchronously, or the data changes more often than the interface needs to render. In those cases, a more imperative approach with `useRerender` may be easier to read and control.

`useRerender` showed me another model: data can change as a regular JavaScript object, while rendering becomes a separate explicit operation. We can update several values, inspect the result, wait for the next frame if necessary, and only then ask React to update the interface. For complex scrolling, this was not a workaround, but the most direct description of what was happening.

When this version first worked, I was surprised by how little machinery remained in the code. I removed several abstractions and gained more control: one mutable model, one way to request a render, and a clear boundary between calculation and display.

That is the essence of manual render invalidation for me. The main idea is not to replace every `useState`, but to stop treating data changes and interface updates as one indivisible operation. I hope this path helps other developers look at React from a slightly different angle.

### Related Articles

If you would like to see the context from which this approach grew, you can also read my other articles:

- [The story of morphing-scroll, my npm library](https://dev.to/voodoofugu/the-story-of-morphing-scroll-my-npm-library-1agb);
- [How I Wrote My Own State Manager](https://dev.to/voodoofugu/how-i-wrote-my-own-state-manager-434h).
