import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { createReactNexus } from "../src/react";

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

  it("respects a custom isEqual comparator", () => {
    const nx = createReactNexus({ state: { list: [1, 2] as number[] } });
    const shallow = (a: number[], b: number[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    const renders = vi.fn();
    function View() {
      renders();
      const list = nx.useSelector((s) => s.list, ["list"], shallow);
      return <span>{list.join(",")}</span>;
    }
    render(<View />);
    renders.mockClear();
    // new array, same contents -> no re-render thanks to comparator
    act(() => nx.set({ list: [1, 2] }));
    expect(renders).not.toHaveBeenCalled();
    // different contents -> re-render
    act(() => nx.set({ list: [1, 2, 3] }));
    expect(renders).toHaveBeenCalledTimes(1);
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
