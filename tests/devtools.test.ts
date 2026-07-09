import { describe, it, expect, afterEach, vi } from "vitest";
import { createNexus } from "../src";
import { devtools } from "../src/devtools";

type Sent = { action: { type: string; meta?: unknown }; state: unknown };

function fakeDevtools() {
  const sent: Sent[] = [];
  let listener: ((m: unknown) => void) | undefined;
  let inited: unknown;
  let disconnected = false;

  const connection = {
    init: (s: unknown) => {
      inited = s;
    },
    send: (action: Sent["action"], state: unknown) => {
      sent.push({ action, state });
    },
    subscribe: (l: (m: unknown) => void) => {
      listener = l;
      return () => {
        listener = undefined;
      };
    },
  };

  const extension = {
    connect: vi.fn(() => connection),
    disconnect: vi.fn(() => {
      disconnected = true;
    }),
  };

  return {
    extension,
    sent,
    get inited() {
      return inited;
    },
    get disconnected() {
      return disconnected;
    },
    get listening() {
      return listener !== undefined;
    },
    emit: (m: unknown) => listener && listener(m),
  };
}

function install(fake: ReturnType<typeof fakeDevtools>) {
  (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: unknown }).__REDUX_DEVTOOLS_EXTENSION__ =
    fake.extension;
}

afterEach(() => {
  delete (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: unknown })
    .__REDUX_DEVTOOLS_EXTENSION__;
});

describe("devtools", () => {
  it("connects and inits with the current state", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    devtools(nx, { name: "Test" });
    expect(fake.extension.connect).toHaveBeenCalledWith({ name: "Test" });
    expect(fake.inited).toEqual({ count: 0 });
  });

  it("sends each update labelled by its source", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    devtools(nx);
    nx.set({ count: 1 }, "user");
    nx.set({ count: 2 }, { source: "server", meta: { id: 7 } });
    expect(fake.sent).toEqual([
      { action: { type: "user" }, state: { count: 1 } },
      { action: { type: "server", meta: { id: 7 } }, state: { count: 2 } },
    ]);
  });

  it("labels updates without a source as 'update'", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    devtools(nx);
    nx.set({ count: 1 });
    expect(fake.sent[0].action.type).toBe("update");
  });

  it("applies time-travel and does not echo it back", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    devtools(nx);
    nx.set({ count: 5 }, "user"); // 1 send
    fake.emit({ type: "DISPATCH", state: JSON.stringify({ count: 42 }) });
    expect(nx.get("count")).toBe(42); // jump applied
    expect(fake.sent).toHaveLength(1); // no echo from the jump
  });

  it("stops sending and disconnects after cleanup", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    const stop = devtools(nx);
    stop();
    expect(fake.disconnected).toBe(true);
    expect(fake.listening).toBe(false);
    nx.set({ count: 1 }, "user");
    expect(fake.sent).toHaveLength(0);
  });

  it("is a no-op when the extension is absent", () => {
    const nx = createNexus({ state: { count: 0 } });
    expect(() => {
      const stop = devtools(nx);
      nx.set({ count: 1 });
      stop();
    }).not.toThrow();
  });

  it("is a no-op when disabled, even if the extension is present", () => {
    const fake = fakeDevtools();
    install(fake);
    const nx = createNexus({ state: { count: 0 } });
    devtools(nx, { enabled: false });
    nx.set({ count: 1 }, "user");
    expect(fake.extension.connect).not.toHaveBeenCalled();
    expect(fake.sent).toHaveLength(0);
  });
});
