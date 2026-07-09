import { describe, it, expect, vi } from "vitest";
import { createNexus } from "../src";
import { computed } from "../src/computed";

describe("computed", () => {
  it("derives and caches a value", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    const total = computed(nx, (s) => s.a + s.b);
    expect(total.get()).toBe(3);
    nx.set({ a: 10 });
    expect(total.get()).toBe(12);
  });

  it("recomputes once, shared across all subscribers", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    const selector = vi.fn((s: { a: number; b: number }) => s.a + s.b);
    const total = computed(nx, selector);
    selector.mockClear();
    total.subscribe(() => {});
    total.subscribe(() => {});
    nx.set({ a: 5 });
    // one recompute for the change, not one per subscriber
    expect(selector).toHaveBeenCalledTimes(1);
  });

  it("auto-tracks: only recomputes when a read key changes", () => {
    const nx = createNexus({ state: { a: 1, b: 2, other: 0 } });
    const selector = vi.fn((s: { a: number; b: number; other: number }) => s.a + s.b);
    const total = computed(nx, selector);
    selector.mockClear();
    nx.set({ other: 99 });
    expect(selector).not.toHaveBeenCalled();
    nx.set({ a: 2 });
    expect(selector).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers only when the result changes", () => {
    const nx = createNexus({ state: { a: 1, b: 1 } });
    const total = computed(nx, (s) => s.a + s.b);
    const cb = vi.fn();
    total.subscribe(cb);
    nx.set({ a: 0, b: 2 }); // sum stays 2
    expect(cb).not.toHaveBeenCalled();
    nx.set({ a: 5 });
    expect(cb).toHaveBeenCalledWith(7);
  });

  it("supports a 'shallow' comparator for object results", () => {
    const nx = createNexus({ state: { items: [{ id: 1 }, { id: 2 }] } });
    const ids = computed(nx, (s) => s.items.map((i) => i.id), "shallow");
    const cb = vi.fn();
    ids.subscribe(cb);
    nx.set({ items: [{ id: 1 }, { id: 2 }] }); // same ids
    expect(cb).not.toHaveBeenCalled();
    nx.set({ items: [{ id: 1 }, { id: 9 }] });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("re-tracks a conditional selector", () => {
    const nx = createNexus({ state: { flag: true, a: 1, b: 100 } });
    const value = computed(nx, (s) => (s.flag ? s.a : s.b));
    const cb = vi.fn();
    value.subscribe(cb);
    nx.set({ b: 200 }); // b not tracked while flag is true
    expect(cb).not.toHaveBeenCalled();
    nx.set({ flag: false });
    expect(value.get()).toBe(200);
    cb.mockClear();
    nx.set({ b: 300 }); // now b is tracked
    expect(cb).toHaveBeenCalledWith(300);
  });

  it("stops updating after dispose", () => {
    const nx = createNexus({ state: { a: 1 } });
    const c = computed(nx, (s) => s.a * 2);
    const cb = vi.fn();
    c.subscribe(cb);
    c.dispose();
    nx.set({ a: 5 });
    expect(cb).not.toHaveBeenCalled();
  });
});
