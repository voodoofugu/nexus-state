import { describe, it, expect, beforeEach, vi } from "vitest";
import { createNexus, persist } from "../src";
import type { PersistStorage } from "../src/persist";

function memoryStorage(): PersistStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("persist", () => {
  let storage: ReturnType<typeof memoryStorage>;
  beforeEach(() => {
    storage = memoryStorage();
  });

  it("writes changes to storage", () => {
    const nx = createNexus({ state: { count: 0 } });
    persist(nx, { key: "app", storage });
    nx.set({ count: 3 });
    expect(JSON.parse(storage.data.get("app")!)).toEqual({
      version: 0,
      state: { count: 3 },
    });
  });

  it("hydrates from storage on init", () => {
    storage.data.set(
      "app",
      JSON.stringify({ version: 0, state: { count: 42 } })
    );
    const nx = createNexus({ state: { count: 0 } });
    persist(nx, { key: "app", storage });
    expect(nx.get("count")).toBe(42);
  });

  it("does not echo hydration back to storage", () => {
    storage.data.set(
      "app",
      JSON.stringify({ version: 0, state: { count: 42 } })
    );
    const nx = createNexus({ state: { count: 0 } });
    const setSpy = vi.spyOn(storage, "setItem");
    persist(nx, { key: "app", storage });
    // hydration used source "storage", so the writer skipped it
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("persists only included keys", () => {
    const nx = createNexus({ state: { a: 1, b: 2 } });
    persist(nx, { key: "app", storage, include: ["a"] });
    nx.set({ a: 9, b: 9 });
    expect(JSON.parse(storage.data.get("app")!).state).toEqual({ a: 9 });
  });

  it("excludes keys from the snapshot", () => {
    const nx = createNexus({ state: { a: 1, secret: "x" } });
    persist(nx, { key: "app", storage, exclude: ["secret"] });
    nx.set({ a: 2 });
    expect(JSON.parse(storage.data.get("app")!).state).toEqual({ a: 2 });
  });

  it("runs migrate when the stored version differs", () => {
    storage.data.set(
      "app",
      JSON.stringify({ version: 1, state: { old: 5 } })
    );
    const nx = createNexus({ state: { value: 0 } });
    persist(nx, {
      key: "app",
      storage,
      version: 2,
      migrate: (old) => ({ value: (old as { old: number }).old }),
    });
    expect(nx.get("value")).toBe(5);
  });

  it("reports parse errors via onError instead of throwing", () => {
    storage.data.set("app", "{ not json");
    const nx = createNexus({ state: { count: 0 } });
    const onError = vi.fn();
    expect(() => persist(nx, { key: "app", storage, onError })).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("stops persisting after the returned disposer is called", () => {
    const nx = createNexus({ state: { count: 0 } });
    const stop = persist(nx, { key: "app", storage });
    stop();
    nx.set({ count: 7 });
    expect(storage.data.get("app")).toBeUndefined();
  });
});
