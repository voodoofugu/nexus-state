# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

The API is settled as of 4.0.0. No further additions are planned; anything
breaking would arrive as a new major.

## 4.0.1 (unreleased)

Documentation only — no behaviour changes, no API changes.

### Fixed

- **`persist` carried no hover documentation.** Its JSDoc block was separated
  from the function by a private constant, so TypeScript attached the
  description to that constant instead. The emitted `.d.ts` now carries it.

### Added

- Interface-level documentation for **`DevtoolsOptions`**, which is exported
  publicly but previously documented only its members.

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
