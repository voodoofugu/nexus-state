/* Compile-only sanity checks for public-API type inference. Not shipped. */
import { createNexus, createActs, persist } from "../src";
import { createReactNexus } from "../src/react";
import type { PersistOptions, EqualityFn } from "../src";

// --- 1. No generics at all: S and A are both inferred ---
const a = createNexus({
  state: { count: 0, name: "x" },
  acts: (get, set) => ({
    inc() {
      set((s) => ({ count: s.count + 1 }));
      this.log(); // cross-action `this` call is typed
    },
    log() {
      console.log(get("count"));
    },
  }),
});
a.acts.inc();
a.acts.log();
const n: number = a.get("count");
// @ts-expect-error unknown act is rejected
a.acts.nope();
// @ts-expect-error unknown key is rejected
a.get("missing");

// --- 2. React nexus without the second (acts) generic — the reported bug ---
const r = createReactNexus({
  state: { count: 0 },
  acts: (_get, set) => ({
    inc() {
      set((s) => ({ count: s.count + 1 }));
    },
  }),
});
r.acts.inc();
// @ts-expect-error still type-safe without explicit A
r.acts.missing();

// useSelector: keys auto-tracked, result type inferred, optional isEqual (2nd arg).
const doubled: number = r.useSelector((s) => s.count * 2);
void doubled;
// "shallow" string shorthand:
const ids: number[] = r.useSelector((s) => [s.count], "shallow");
void ids;
// custom comparator, typed against the result:
r.useSelector(
  (s) => [s.count],
  (prev, next) => prev.length === next.length && prev[0] === next[0]
);
// @ts-expect-error comparator must match the selector result type
r.useSelector((s) => s.count, (a: string, b: string) => a === b);
// @ts-expect-error only "shallow" is a valid string strategy
r.useSelector((s) => s.count, "deep");
const numberEq: EqualityFn<number> = (a, b) => a === b;
void numberEq;

// subscribe still requires explicit dependencies (low-level primitive).
// @ts-expect-error subscribe requires dependencies
a.subscribe((state) => void state.count);

// --- 3. No acts at all: acts is empty, not `any` ---
const b = createNexus({ state: { ok: true } });
// @ts-expect-error acts is `Record<string, never>`
b.acts.anything();

// --- 4. set context shapes + middleware unsubscribe + root persist export ---
a.set({ count: 1 }, "server");
a.set({ count: 2 }, { source: "server", meta: { id: 1 } });
const off = a.middleware((_p, next) => next);
off();
a.subscribe((state, ctx) => {
  void state.count;
  void ctx?.source;
}, ["count"]);
const persistOptions: PersistOptions<{ count: number; name: string }> = {
  key: "types",
};
persist(a, persistOptions);

// --- 5. createActs slice with typed cross-slice `this` ---
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
createNexus<S, A>({ state: { count: 0 }, acts: slice });
createNexus<S, A>({ state: { count: 0 }, acts: [slice] });

export { a, r, b, n };
