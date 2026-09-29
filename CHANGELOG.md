# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

The API is settled as of 4.0.0. No further additions are planned; anything
breaking would arrive as a new major.

## 4.0.2 — 2026-09-29

A single fix to the previous release. No API changes.

### Fixed

- **The hover logo did not render outside the library's own sources.** 4.0.1
  shipped the image inside the package and pointed at it with a relative path,
  which looked correct while browsing the library in `node_modules`. It is not:
  an editor resolves the image against the file the hover is displayed in — the
  consumer's own file — not against the declaration the text came from, so the
  path never matched and the logo showed as broken. The image is served from a
  URL again, now the SVG wordmark, addressed directly on
  `raw.githubusercontent.com` to skip the redirect the `github.com/raw` form
  goes through.

  Embedding the image as a data URI would sidestep both the network and the
  path, but the banner repeats 160 times across the bundled declarations, which
  adds roughly 1.2 MB unpacked — so it was measured and rejected.

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
  contrast threshold on both light and dark, and stays sharp on any display. It
  ships inside the package and is referenced by a relative path, so no request
  leaves the machine. (This part did not work — see 4.0.2.)

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
