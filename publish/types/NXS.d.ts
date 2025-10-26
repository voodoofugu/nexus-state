import type { createNexus } from "./createNexus";
import type { createReactNexus } from "./createReactNexus";
import type { createActs } from "./createActs";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`nexus`*:
 * the entire library exported as a single default object.
 *
 * Provides access to the main API functions:
 * - {@link createNexus}
 * - {@link createReactNexus}
 * - {@link createActs}
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
export declare const NXS: {
  /** More information in import { createNexus } */
  createNexus: typeof createNexus;
  /** More information in import { createReactNexus } */
  createReactNexus: typeof createReactNexus;
  /** More information in import { createActs } */
  createActs: typeof createActs;
};
