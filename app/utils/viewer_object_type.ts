import type { ViewerObjectTyped } from "@ogw_front/types/identifiers";

function isModel<Item extends Partial<ViewerObjectTyped>>(
  item: Item,
): item is Item & { viewer_object_type: "model" } {
  return item.viewer_object_type === "model";
}

function isMesh<Item extends Partial<ViewerObjectTyped>>(
  item: Item,
): item is Item & { viewer_object_type: "mesh" } {
  return item.viewer_object_type === "mesh";
}

export { isMesh, isModel };
