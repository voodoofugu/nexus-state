import type { RecordAny } from "./types/core";

/**
 * `Object.is` semantics, hand-rolled so it works without the `Object.is`
 * global on very old engines. Mirrors React's own `objectIs` shim.
 */
function sameValue<T>(a: T, b: T): boolean {
  if (a === b) {
    const left = a as unknown as number;
    const right = b as unknown as number;
    return left !== 0 || 1 / left === 1 / right;
  }
  return a !== a && b !== b;
}

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***shallow***:
 * one-level equality helper.
 * @description
 * A plain function (not a hook, no React dependency). Returns `true` when two
 * values are equal at the first level: `Object.is` for primitives, and same keys
 * with `Object.is` values for objects and arrays. Pass it as the third argument
 * to `useSelector` when the selector returns a freshly built object or array so
 * an equal result does not re-render — or use it anywhere you need a cheap
 * one-level comparison.
 * @example
 * ```ts
 * import { shallow } from "nexus-state";
 *
 * shallow([1, 2], [1, 2]); // true
 * shallow({ a: 1 }, { a: 2 }); // false
 * ```
 */
function shallow<T>(a: T, b: T): boolean {
  if (sameValue(a, b)) return true;
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a as RecordAny);
  const bKeys = Object.keys(b as RecordAny);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      sameValue((a as RecordAny)[key], (b as RecordAny)[key])
  );
}

export { sameValue, shallow };
