import type { ModelIdentified } from "@ogw_front/types/identifiers";

function compareSelections<Item>(
  current: readonly Item[],
  previous: readonly Item[],
): { added: Item[]; removed: Item[] } {
  const added = current.filter((item) => !previous.includes(item));
  const removed = previous.filter((item) => !current.includes(item));
  return { added, removed };
}

interface DataMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type?: undefined;
}

interface GeodeObjectTypeMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type: "geode_object_type";
  targetIds: string[];
}

interface ModelComponentMenuPayload extends ModelIdentified {
  event: MouseEvent;
  itemId: string;
  context_type: "model_component" | "model_component_type";
  modelComponentType?: string;
  targetComponentIds?: string[];
}

// The basemap category and its maps: not project data
interface BasemapMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type: "basemap";
}

type TreeMenuPayload =
  | DataMenuPayload
  | GeodeObjectTypeMenuPayload
  | ModelComponentMenuPayload
  | BasemapMenuPayload;

export { compareSelections };
export type {
  DataMenuPayload,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
