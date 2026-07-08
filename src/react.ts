import createReactNexus from "./nexus-react";
import createNexus from "./nexus-core";
import createActs from "./createActs";
import persist from "./persist";

export { createReactNexus, createNexus, createActs, persist };
export type {
  ReactNexus,
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
 * ### ***nexusReact***:
 * default namespace-style export for the React entry point.
 * @description
 * Prefer named imports for tree-shaking and readability. The default export is
 * provided for users who like `nexus.createReactNexus(...)` style access.
 * @example
 * ```tsx
 * import nexus from "nexus-state/react";
 *
 * const store = nexus.createReactNexus({
 *   state: { count: 0 },
 * });
 *
 * nexus.persist(store, { key: "counter" });
 * ```
 */
const nexus = { createReactNexus, createNexus, createActs, persist };
export default nexus;
