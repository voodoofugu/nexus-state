import type { Setter, Getter, RecordAny, ActsPart } from "./types/core";

/**
 * Wraps an acts slice for code-splitting. `this` is typed as the *complete*
 * acts object, so cross-slice calls don't need optional chaining.
 * Pass one or more slices to `acts: [sliceA, sliceB]` when creating a nexus.
 */
/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***createActs***:
 * creates a reusable action slice for `createNexus` or `createReactNexus`.
 * @description
 * Use `createActs` to split actions across files. Inside each slice, `this` is
 * typed as the complete acts object, so actions can call other actions from the
 * same or another slice.
 * @param create slice factory that receives `get` and `set`.
 * @returns an action slice accepted by `acts: [sliceA, sliceB]`.
 * @example
 * ```ts
 * import { createActs, createNexus } from "nexus-state";
 *
 * type State = { count: number };
 * type Actions = {
 *   increment(): void;
 *   logCount(): void;
 * };
 *
 * const counterActs = createActs<State, Actions>(function (get, set) {
 *   return {
 *     increment() {
 *       set({ count: get("count") + 1 });
 *       this.logCount();
 *     },
 *     logCount() {
 *       console.log(get("count"));
 *     },
 *   };
 * });
 *
 * const nexus = createNexus<State, Actions>({
 *   state: { count: 0 },
 *   acts: [counterActs],
 * });
 * ```
 */
function createActs<S extends RecordAny, A extends RecordAny = RecordAny>(
  create: (this: A, get: Getter<S>, set: Setter<S>) => Partial<A> & ThisType<A>
): ActsPart<S, A> {
  return function (this: A, get: Getter<S>, set: Setter<S>) {
    return create.call(this, get, set);
  };
}

export default createActs;
