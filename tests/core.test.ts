import { describe, it, expect, vi } from "vitest";
import { createNexus, createActs } from "../src";

describe("get / set", () => {
  it("reads whole state and single keys", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    expect(nx.get()).toEqual({ a: 1, b: 2 });
    expect(nx.get("a")).toBe(1);
  });

  it("applies partial and functional updates", () => {
    const nx = createNexus({ state: { count: 0 } });
    nx.set({ count: 5 });
    expect(nx.get("count")).toBe(5);
    nx.set((s) => ({ count: s.count + 1 }));
    expect(nx.get("count")).toBe(6);
  });

  it("does not notify when nothing changed", () => {
    const nx = createNexus({ state: { count: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["count"]);
    nx.set({ count: 0 });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("subscribe", () => {
  it("notifies only relevant key subscribers", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const onA = vi.fn();
    const onB = vi.fn();
    nx.subscribe(onA, ["a"]);
    nx.subscribe(onB, ["b"]);
    nx.set({ a: 1 });
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).not.toHaveBeenCalled();
  });

  it("fires a multi-key subscriber exactly once per update (dedup)", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["a", "b"]);
    nx.set({ a: 1, b: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("wildcard subscribers see every change once", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["*"]);
    nx.set({ a: 1, b: 2 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns a working unsubscribe", () => {
    const nx = createNexus({ state: { a: 0 } });
    const spy = vi.fn();
    const off = nx.subscribe(spy, ["a"]);
    off();
    nx.set({ a: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  it("defaults dependencies to the whole state", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy);
    nx.set({ b: 9 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("context / provenance", () => {
  it("passes normalized string context to subscribers", () => {
    const nx = createNexus({ state: { a: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["a"]);
    nx.set({ a: 1 }, "server");
    expect(spy).toHaveBeenCalledWith(expect.anything(), { source: "server" });
  });

  it("passes object context with meta through middleware", () => {
    const nx = createNexus({ state: { a: 0 } });
    const seen: unknown[] = [];
    nx.middleware((_p, next, ctx) => {
      seen.push(ctx);
      return next;
    });
    nx.set({ a: 1 }, { source: "server", meta: { id: 7 } });
    expect(seen).toEqual([{ source: "server", meta: { id: 7 } }]);
  });
});

describe("reset", () => {
  it("resets the whole state to initial", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    nx.set({ a: 10, b: 20 });
    nx.reset();
    expect(nx.get()).toEqual({ a: 1, b: 2 });
  });

  it("resets specific keys only", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    nx.set({ a: 10, b: 20 });
    nx.reset("a");
    expect(nx.get()).toEqual({ a: 1, b: 20 });
  });

  it("routes resets through middleware with source 'reset'", () => {
    const nx = createNexus({ state: { a: 1 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["a"]);
    nx.set({ a: 5 });
    nx.reset("a");
    expect(spy).toHaveBeenLastCalledWith(expect.anything(), {
      source: "reset",
    });
  });
});

describe("middleware", () => {
  it("can replace the next state", () => {
    const nx = createNexus({ state: { count: 0 } });
    nx.middleware((_p, next) => ({ ...next, count: next.count * 2 }));
    nx.set({ count: 5 });
    expect(nx.get("count")).toBe(10);
  });

  it("returns an unsubscribe that detaches it", () => {
    const nx = createNexus({ state: { count: 0 } });
    const off = nx.middleware((_p, next) => ({ ...next, count: 99 }));
    off();
    nx.set({ count: 5 });
    expect(nx.get("count")).toBe(5);
  });
});

describe("batch", () => {
  it("collapses multiple sets into one notification", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["*"]);
    nx.batch(() => {
      nx.set({ a: 1 });
      nx.set({ b: 2 });
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(nx.get()).toEqual({ a: 1, b: 2 });
  });

  it("supports nesting", () => {
    const nx = createNexus({ state: { a: 0, b: 0 } });
    const spy = vi.fn();
    nx.subscribe(spy, ["*"]);
    nx.batch(() => {
      nx.set({ a: 1 });
      nx.batch(() => nx.set({ b: 2 }));
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("acts", () => {
  it("exposes actions and supports cross-action `this` calls", () => {
    const log: number[] = [];
    const nx = createNexus({
      state: { count: 0 },
      acts: (get, set) => ({
        inc() {
          set((s) => ({ count: s.count + 1 }));
          this.record();
        },
        record() {
          log.push(get("count"));
        },
      }),
    });
    nx.acts.inc();
    expect(nx.get("count")).toBe(1);
    expect(log).toEqual([1]);
  });

  it("keeps `this` bound when actions are destructured", () => {
    const nx = createNexus({
      state: { count: 0 },
      acts: (_g, set) => ({
        inc() {
          set((s) => ({ count: s.count + 1 }));
        },
      }),
    });
    const { inc } = nx.acts;
    inc();
    expect(nx.get("count")).toBe(1);
  });

  it("merges multiple createActs slices with typed cross-slice calls", () => {
    type S = { count: number };
    type A = { inc(): void; twice(): void };
    const slice = createActs<S, A>(function (_get, set) {
      return {
        inc() {
          set((s) => ({ count: s.count + 1 }));
        },
        twice() {
          this.inc();
          this.inc();
        },
      };
    });
    const nx = createNexus<S, A>({ state: { count: 0 }, acts: [slice] });
    nx.acts.twice();
    expect(nx.get("count")).toBe(2);
  });
});
