/* Compile-only sanity checks for public-API type inference. Not shipped. */
import { createNexus, createActs, persist, shallow } from "../src";
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

// useSelector: result type inferred, optional isEqual typed against it.
const doubled: number = r.useSelector((s) => s.count * 2, ["count"]);
void doubled;
const ids: number[] = r.useSelector(
  (s) => [s.count],
  ["count"],
  shallow
);
void ids;
r.useSelector(
  (s) => [s.count],
  ["count"],
  // isEqual is (a: number[], b: number[]) => boolean here
  (prev, next) => prev.length === next.length && prev[0] === next[0]
);
// @ts-expect-error comparator must match the selector result type
r.useSelector((s) => s.count, ["count"], (a: string, b: string) => a === b);
const numberEq: EqualityFn<number> = (a, b) => a === b;
void numberEq;

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
