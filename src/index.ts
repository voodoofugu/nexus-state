import createNexus from "./nexus-core";
import createActs from "./createActs";
import { persist } from "./persist";
import { shallow } from "./shallow";

export { createNexus, createActs, persist, shallow };
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
  EqualityFn,
  ActsCreate,
  ActsPart,
  ActsCreateUnion,
  NexusOptions,
} from "./types/core";
export type { PersistStorage, PersistOptions } from "./persist";
