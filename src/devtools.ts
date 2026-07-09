import type { Nexus, RecordAny } from "./types/core";

/** Source tag for state written back by devtools time-travel (skipped on send). */
const DEVTOOLS_SOURCE = "@@devtools";

/** Message shape sent from the Redux DevTools UI back to the app. */
interface DevtoolsMessage {
  type: string; // "DISPATCH" | "ACTION" | "START" | "STOP" | ...
  payload?: { type?: string; [key: string]: unknown };
  state?: string;
}

interface DevtoolsConnection {
  init(state: unknown): void;
  send(action: { type: string; [key: string]: unknown }, state: unknown): void;
  subscribe(listener: (message: DevtoolsMessage) => void): (() => void) | void;
  unsubscribe?(): void;
}

interface DevtoolsExtension {
  connect(options: { name?: string }): DevtoolsConnection;
  disconnect?(): void;
}

interface DevtoolsOptions {
  /** Instance name shown in the Redux DevTools dropdown. */
  name?: string;
  /**
   * Set `false` to disable (e.g. in production). Defaults to `true`; the adapter
   * is still a no-op when the extension is not installed.
   */
  enabled?: boolean;
}

function getExtension(): DevtoolsExtension | undefined {
  try {
    const w =
      typeof window !== "undefined"
        ? (window as unknown as {
            __REDUX_DEVTOOLS_EXTENSION__?: DevtoolsExtension;
          })
        : undefined;
    return w ? w.__REDUX_DEVTOOLS_EXTENSION__ : undefined;
  } catch {
    /* accessing window can throw in sandboxed contexts */
    return undefined;
  }
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***devtools***:
 * connects a nexus to the Redux DevTools browser extension.
 * @description
 * Every update is sent to Redux DevTools as an action whose **type is the update
 * `source`** (`"server"`, `"storage"`, `"reset"`, or your own) — so the timeline
 * shows *where each change came from*, not just that it happened. Time-travel
 * (jump / reset / rollback) writes the selected state back with a private source
 * that the sender skips, so there is no echo loop.
 *
 * A no-op when the extension is not installed or `enabled` is `false`, so it is
 * safe to leave in place. Returns a cleanup function that disconnects.
 * @param nexus nexus instance created by `createNexus` or `createReactNexus`.
 * @param options devtools configuration.
 * @returns cleanup function that stops sending and disconnects.
 * @example
 * ```ts
 * import { createNexus } from "nexus-state";
 * import { devtools } from "nexus-state/devtools";
 *
 * const nexus = createNexus({ state: { count: 0 } });
 * const stop = devtools(nexus, { name: "Counter" });
 *
 * nexus.set({ count: 1 }, "user"); // appears in DevTools as action "user"
 * stop();
 * ```
 */
function devtools<S extends RecordAny, A extends RecordAny>(
  nexus: Nexus<S, A>,
  options: DevtoolsOptions = {}
): () => void {
  const { name = "nexus-state", enabled = true } = options;
  const extension = enabled ? getExtension() : undefined;
  if (!extension) return () => {};

  const connection = extension.connect({ name });
  connection.init(nexus.get());

  // Send every real change, labelled by its provenance.
  const unsubscribe = nexus.subscribe((state, context) => {
    if (context && context.source === DEVTOOLS_SOURCE) return;
    const action: { type: string; meta?: RecordAny } = {
      type: (context && context.source) || "update",
    };
    if (context && context.meta) action.meta = context.meta;
    connection.send(action, state);
  }, ["*"]);

  // Apply time-travel from the DevTools UI. Jump / reset / rollback all carry the
  // target state as a JSON string; write it back tagged so `subscribe` skips it.
  const unsubscribeDevtools = connection.subscribe((message) => {
    if (message.type === "DISPATCH" && typeof message.state === "string") {
      try {
        const nextState = JSON.parse(message.state) as Partial<S>;
        nexus.set(nextState, DEVTOOLS_SOURCE);
      } catch {
        /* malformed payload — ignore */
      }
    }
  });

  return () => {
    unsubscribe();
    if (unsubscribeDevtools) unsubscribeDevtools();
    if (extension.disconnect) extension.disconnect();
  };
}

export type { DevtoolsOptions };
export { devtools };
export default devtools;
