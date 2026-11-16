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

// Colors that tie each opened model tree to its row in the objects tree
const MODEL_TREE_COLORS = [
  "#1E88E5",
  "#E53935",
  "#43A047",
  "#FB8C00",
  "#8E24AA",
  "#00ACC1",
  "#D81B60",
  "#6D4C41",
] as const;

// The first color no opened tree uses, cycling once they are all taken
function nextModelTreeColor(usedColors: readonly (string | undefined)[]): string {
  const free = MODEL_TREE_COLORS.find((color) => !usedColors.includes(color));
  return free ?? MODEL_TREE_COLORS[usedColors.length % MODEL_TREE_COLORS.length] ?? "";
}

export { MODEL_TREE_COLORS, compareSelections, nextModelTreeColor };
export type {
  DataMenuPayload,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
