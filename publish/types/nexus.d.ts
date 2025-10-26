import type { createStore } from "./createStore";
import type { createReactStore } from "./createReactStore";
import type { createActions } from "./createActions";

/**---
 * ## ![logo](https://github.com/voodoofugu/nexus-state/raw/main/src/assets/nexus-state-logo.png)
 * ### *`nexus`*:
 * the entire library exported as a single default object.
 *
 * Provides access to the main API functions:
 * - {@link createStore}
 * - {@link createReactStore}
 * - {@link createActions}
 * @see [nexus-state](https://www.npmjs.com/package/nexus-state)
 */
export declare const nexus: {
  /** More information in import { createStore } */
  createStore: typeof createStore;
  /** More information in import { createReactStore } */
  createReactStore: typeof createReactStore;
  /** More information in import { createActions } */
  createActions: typeof createActions;
};
