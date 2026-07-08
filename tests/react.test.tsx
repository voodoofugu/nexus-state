import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { createReactNexus } from "../src/react";
import { shallow } from "../src";

afterEach(cleanup);

describe("use", () => {
  it("renders a single key and re-renders on change", () => {
    const nx = createReactNexus({ state: { count: 0 } });
    function View() {
      const count = nx.use("count");
      return <span data-testid="v">{count}</span>;
    }
    render(<View />);
    expect(screen.getByTestId("v").textContent).toBe("0");
    act(() => nx.set({ count: 3 }));
    expect(screen.getByTestId("v").textContent).toBe("3");
  });

  it("does not re-render a key component when an unrelated key changes", () => {
    const nx = createReactNexus({ state: { a: 0, b: 0 } });
    const renders = vi.fn();
    function View() {
      renders();
      const a = nx.use("a");
      return <span>{a}</span>;
    }
    render(<View />);
    renders.mockClear();
    act(() => nx.set({ b: 1 }));
    expect(renders).not.toHaveBeenCalled();
  });
});

describe("useSelector", () => {
  it("derives a value and updates when dependencies change", () => {
    const nx = createReactNexus({ state: { a: 1, b: 2 } });
    function View() {
      const total = nx.useSelector((s) => s.a + s.b, ["a", "b"]);
      return <span data-testid="t">{total}</span>;
    }
    render(<View />);
    expect(screen.getByTestId("t").textContent).toBe("3");
    act(() => nx.set({ a: 10 }));
    expect(screen.getByTestId("t").textContent).toBe("12");
  });

  it("does not re-render when the derived value is unchanged", () => {
    const nx = createReactNexus({ state: { a: 1, other: 0 } });
    const renders = vi.fn();
    function View() {
      renders();
      // selector ignores `other`, but subscribes via ["*"]
      const doubled = nx.useSelector((s) => s.a * 2, ["*"]);
      return <span>{doubled}</span>;
    }
    render(<View />);
    renders.mockClear();
    act(() => nx.set({ other: 5 }));
    expect(renders).not.toHaveBeenCalled();
  });

  it("treats new object and array references as changed values", () => {
    const nx = createReactNexus({ state: { list: [1, 2] as number[] } });
    const renders = vi.fn();
    function View() {
      renders();
      const list = nx.useSelector((s) => s.list, ["list"]);
      return <span>{list.join(",")}</span>;
    }
    render(<View />);
    renders.mockClear();
    // New array, same contents: Object.is sees a new reference.
    act(() => nx.set({ list: [1, 2] }));
    expect(renders).toHaveBeenCalledTimes(1);
    act(() => nx.set({ list: [1, 2, 3] }));
    expect(renders).toHaveBeenCalledTimes(2);
  });

  it("with shallow, a new array of equal contents does not re-render", () => {
    const nx = createReactNexus({ state: { items: [{ id: 1 }, { id: 2 }] } });
    const renders = vi.fn();
    function View() {
      renders();
      const ids = nx.useSelector(
        (s) => s.items.map((i) => i.id),
        ["items"],
        shallow
      );
      return <span>{ids.join(",")}</span>;
    }
    render(<View />);
    renders.mockClear();
    // New array from map(), same numeric ids -> shallow equal -> no re-render.
    act(() => nx.set({ items: [{ id: 1 }, { id: 2 }] }));
    expect(renders).not.toHaveBeenCalled();
    // Different ids -> shallow sees a change -> re-render.
    act(() => nx.set({ items: [{ id: 1 }, { id: 9 }] }));
    expect(renders).toHaveBeenCalledTimes(1);
  });
});

describe("shallow helper", () => {
  it("compares primitives with Object.is semantics", () => {
    expect(shallow(1, 1)).toBe(true);
    expect(shallow(NaN, NaN)).toBe(true);
    expect(shallow(0, -0)).toBe(false);
    expect(shallow("a", "b")).toBe(false);
  });

  it("compares arrays one level deep", () => {
    expect(shallow([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(shallow([1, 2], [1, 2, 3])).toBe(false);
    expect(shallow([{ id: 1 }], [{ id: 1 }])).toBe(false); // nested refs differ
  });

  it("compares plain objects one level deep", () => {
    expect(shallow({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(shallow({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallow({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("treats null and non-objects safely", () => {
    expect(shallow(null, null)).toBe(true);
    expect(shallow(null, {})).toBe(false);
    expect(shallow({}, null)).toBe(false);
  });
});

describe("useRerender", () => {
  it("forces a re-render on demand", () => {
    const nx = createReactNexus({ state: { x: 0 } });
    let external = 0;
    const renders = vi.fn();
    let force: () => void = () => {};
    function View() {
      renders();
      force = nx.useRerender();
      return <span>{external}</span>;
    }
    render(<View />);
    renders.mockClear();
    external = 1;
    act(() => force());
    expect(renders).toHaveBeenCalledTimes(1);
  });
});

describe("acts in components", () => {
  it("drives state from an action", () => {
    const nx = createReactNexus({
      state: { count: 0 },
      acts: (_g, set) => ({
        inc() {
          set((s) => ({ count: s.count + 1 }));
        },
      }),
    });
    function View() {
      const count = nx.use("count");
      return (
        <button onClick={() => nx.acts.inc()}>{count}</button>
      );
    }
    render(<View />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toBe("0");
    fireEvent.click(btn);
    expect(btn.textContent).toBe("1");
  });
});
