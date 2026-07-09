import type { RecordAny, Dependencies } from "./types/core";

/**
 * Runs `selector` against a shallow tracking proxy of `state` and reports which
 * top-level keys it read. Only the top level is proxied — subscriptions are
 * top-level — and nested values are returned as-is via `Reflect.get`, so no deep
 * proxy is built and object identity below the top level is preserved.
 */
function track<S extends RecordAny, R>(
  state: S,
  selector: (state: S) => R
): { value: R; keys: Dependencies<S> } {
  const accessed = new Set<keyof S>();
  let watchAll = false;

  const proxy = new Proxy(state, {
    get(target, prop, receiver) {
      if (typeof prop === "string") accessed.add(prop as keyof S);
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (typeof prop === "string") accessed.add(prop as keyof S);
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      // Enumerating keys (Object.keys, spread, for..in) means the selector
      // depends on the whole shape, so fall back to watching everything.
      watchAll = true;
      return Reflect.ownKeys(target);
    },
  });

  const value = selector(proxy as S);
  const keys: Dependencies<S> = watchAll
    ? ["*"]
    : (Array.from(accessed) as (keyof S)[]);

  return { value, keys };
}

export { track };
