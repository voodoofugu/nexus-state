import createNexus from "./nexus-core";
import createActs from "./createActs";
import persist from "./persist";

export { createNexus, createActs, persist };
export type {
  Nexus,
  Setter,
  Getter,
  Source,
  UpdateContext,
  SetContext,
  Middleware,
  Observer,
  Dependencies,
  ActsCreate,
  ActsPart,
  ActsCreateUnion,
  NexusOptions,
} from "./types/core";
export type { PersistStorage, PersistOptions } from "./persist";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### ***nexus***:
 * default namespace-style export for the core entry point.
 * @description
 * Prefer named imports for tree-shaking and readability. The default export is
 * provided for users who like `nexus.createNexus(...)` style access.
 * @example
 * ```ts
 * import nexus from "nexus-state";
 *
 * const store = nexus.createNexus({
 *   state: { count: 0 },
 * });
 *
 * nexus.persist(store, { key: "counter" });
 * ```
 */
const nexus = { createNexus, createActs, persist };
export default nexus;
