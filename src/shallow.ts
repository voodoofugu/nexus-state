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

/**
 * One-level equality: `Object.is` for primitives, and same keys with `Object.is`
 * values for objects and arrays.
 *
 * Internal — not a public export. Callers reach it by passing the string
 * `"shallow"` as the second argument of `useSelector`, which resolves to this
 * function.
 *
 * ```ts
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
