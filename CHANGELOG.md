# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

The API is settled as of 4.0.0. No further additions are planned; anything
breaking would arrive as a new major.

## 4.0.1 — 2026-09-28

A documentation pass plus one behaviour fix. No API changes.

### Fixed

- **Middleware did not see the action name.** Updates made inside an action are
  auto-tagged with the action as their `source`, but that name was resolved only
  when the batch flushed — after middleware had already run, so a middleware saw
  `undefined` where a subscriber saw the action. Both now receive the same
  context. An explicit `source` still wins, and subscribers are unaffected.

- **`persist` carried no hover documentation.** Its JSDoc block was separated
  from the function by a private constant, so TypeScript attached the
  description to that constant instead. The emitted `.d.ts` now carries it.

- **`EqualityFn` promised an export that does not exist.** Its documentation
  told callers to "pass the exported `shallow` helper", but `shallow` stopped
  being a public export in 4.0.0 — the string `"shallow"` replaced it. The text
  now points at the string, and `shallow` is marked internal in the source,
  with its stale "third argument" corrected to the second.

### Added

- Interface-level documentation for **`DevtoolsOptions`**, which is exported
  publicly but previously documented only its members.

### Changed

- **The logo in hover documentation is now an SVG with the wordmark.** The
  previous bitmap washed out on light editor themes; the replacement clears the
  contrast threshold on both light and dark, and stays sharp on any display.
  Shipping it inside the package was tried and reverted: editors resolve a
  relative image against the file the hover is shown in, not the declaration it
  came from, so it only rendered while browsing the library's own sources.

## 4.0.0 — 2026-07-10

Major rewrite.

### Breaking

- **Entry points split.** `createReactNexus` now lives in `nexus-state/react`
  (react is an optional peer dependency). The core `nexus-state` has zero
  dependencies and no React.
- **`subscribe` requires explicit `dependencies`.** Pass `["*"]` to watch every
  key. (Runtime keeps a `["*"]` fallback so plain-JS callers don't crash.)
- **`useSelector(selector, isEqual?)`** — the dependency array is gone; the keys
  the selector reads are tracked automatically. `isEqual` is now the 2nd argument
  and accepts `"shallow"` or a custom `(a, b) => boolean`.
- **`set` context unified** to a single `source | { source, meta }` argument.

### Added

- **Traceable state.** Every update carries a `context` (`source`/`meta`) that
  flows through middleware **and** subscribers. Updates made inside an action are
  auto-tagged with the action name as their `source`.
- **`persist`** (`nexus-state`) — storage sync with provenance-based no-echo
  hydration, `include` / `version` / `migrate` / `onError`.
- **`devtools`** (`nexus-state/devtools`) — Redux DevTools adapter; actions are
  labelled by their `source`, with time-travel.
- **`createActs`** — reusable action slices with typed cross-slice `this`.
- **Automatic batching per action**; one `set` with several keys notifies once.
- **Inference-first types** — state and actions are inferred from the config.
- Recipes for **Immer** (nested updates) and **SSR / Next.js** in the README.

### Internal / packaging

- Dual ESM + CJS build with per-entry bundled declarations (`.d.ts` / `.d.cts`);
  `@arethetypeswrong/cli` clean across node10 / node16 / bundler.
