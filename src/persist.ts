import type { Nexus, RecordAny, Dependencies } from "./types/core";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***PersistStorage***:
 * minimal synchronous storage contract used by `persist`.
 * @description
 * `localStorage` and `sessionStorage` satisfy this interface. Custom storage is
 * useful for tests, memory adapters, encrypted storage or platform-specific
 * persistence.
 * @example
 * ```ts
 * const cache: Record<string, string> = {};
 *
 * const memoryStorage: PersistStorage = {
 *   getItem: (key) => cache[key] ?? null,
 *   setItem: (key, value) => {
 *     cache[key] = value;
 *   },
 *   removeItem: (key) => {
 *     delete cache[key];
 *   },
 * };
 * ```
 */
interface PersistStorage {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***getItem***:
   * reads a persisted string value by key.
   * @returns persisted value, or `null` when no value exists.
   */
  getItem(key: string): string | null;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***setItem***:
   * writes a serialized string value by key.
   */
  setItem(key: string, value: string): void;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***removeItem***:
   * removes a persisted value by key.
   */
  removeItem(key: string): void;
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***PersistOptions***:
 * configuration object accepted by `persist`.
 * @description
 * Controls where state is stored, which keys are persisted and how older
 * snapshots are migrated. The storage backend is synchronous and string-based,
 * matching `localStorage`, `sessionStorage` and small custom adapters.
 * @example
 * ```ts
 * persist(nexus, {
 *   key: "counter",
 *   include: ["count"],
 *   version: 2,
 *   migrate: (state, from) => from === 1 ? { count: state.value } : state,
 * });
 * ```
 */
interface PersistOptions<S> {
  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***key***:
   * storage key used for the persisted snapshot.
   */
  key: string;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***storage***:
   * storage backend used by `persist`.
   * @description
   * Defaults to `localStorage` when it is available. If no storage is available,
   * `persist` becomes a no-op and returns an empty cleanup function.
   */
  storage?: PersistStorage;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***include***:
   * state keys that should be persisted.
   * @description
   * Omit `include` to persist the whole state.
   */
  include?: (keyof S)[];

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***version***:
   * persisted schema version.
   * @description
   * Bump this number when the persisted shape changes so `migrate` can transform
   * older snapshots.
   */
  version?: number;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***migrate***:
   * transforms an older persisted snapshot into the current state shape.
   * @param persisted raw persisted state object.
   * @param from version stored in the persisted snapshot.
   * @returns partial state to hydrate into the nexus.
   */
  migrate?: (persisted: RecordAny, from: number) => Partial<S>;

  /**---
   * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
   * ### ***onError***:
   * receives storage, JSON parse or serialization errors.
   * @description
   * Errors are reported here instead of being thrown from `persist`.
   */
  onError?: (error: unknown) => void;
}

function defaultStorage(): PersistStorage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* access can throw in sandboxed / privacy modes */
  }
  return null;
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***persist***:
 * syncs a nexus with persistent storage.
 * @description
 * Hydration is labelled `source: "storage"` (visible to subscribers / devtools)
 * and carries a private `meta` marker; the write-back guard keys off that marker,
 * so loading from disk never echoes back — and no user `source` (even an action
 * named `"storage"`) can be mistaken for hydration. Returns a cleanup function
 * that stops persisting future updates.
 * @param nexus nexus instance created by `createNexus` or `createReactNexus`.
 * @param options persistence configuration.
 * @returns cleanup function that unsubscribes the persistence listener.
 * @example
 * ```ts
 * import { createNexus, persist } from "nexus-state";
 *
 * const nexus = createNexus({ state: { count: 0 } });
 *
 * const stopPersisting = persist(nexus, {
 *   key: "counter",
 *   include: ["count"],
 * });
 *
 * stopPersisting();
 * ```
 */
/**
 * Private `meta` marker set on hydration. The write-back guard keys off this, not
 * off `source`, so no user `source` — including an action named `"storage"` —
 * can ever be mistaken for hydration.
 */
const HYDRATED = "@@nexus/hydrated";

function persist<S extends RecordAny, A extends RecordAny>(
  nexus: Nexus<S, A>,
  options: PersistOptions<S>
): () => void {
  const { key, version = 0, include, migrate, onError } = options;
  const storage = options.storage ?? defaultStorage();
  if (!storage) return () => {};

  const pick = (state: S): Partial<S> => {
    const out: Partial<S> = {};
    const keys = include ?? (Object.keys(state) as (keyof S)[]);
    for (const k of keys) out[k] = state[k];
    return out;
  };

  // --- hydrate from storage ---
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { version: number; state: RecordAny };
      const data =
        migrate && parsed.version !== version
          ? migrate(parsed.state, parsed.version)
          : (parsed.state as Partial<S>);
      nexus.set(data, { source: "storage", meta: { [HYDRATED]: true } });
    }
  } catch (error) {
    onError?.(error);
  }

  // --- write back on change (ignoring our own hydration) ---
  const deps: Dependencies<S> =
    include && include.length ? include : ["*"];

  return nexus.subscribe((state, context) => {
    // Skip our own hydration, and any internal `@@`-prefixed source (e.g. a
    // devtools time-travel jump) — those aren't real user changes to persist.
    if (context?.meta && context.meta[HYDRATED]) return;
    if (context?.source && context.source.slice(0, 2) === "@@") return;
    try {
      storage.setItem(key, JSON.stringify({ version, state: pick(state) }));
    } catch (error) {
      onError?.(error);
    }
  }, deps);
}

export type { PersistStorage, PersistOptions };
export { persist };
