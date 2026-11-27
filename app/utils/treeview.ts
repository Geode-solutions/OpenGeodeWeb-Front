import type { GeodeObjectTyped, ModelIdentified } from "@ogw_front/types/identifiers";
import type { TreeGroup, TreeNode } from "@ogw_front/types/tree";

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

// The physical properties tree of a model, next to its model tree
function physicalPropertiesViewId(modelId: string): string {
  return `${modelId}:physical_properties`;
}

// The model a tree shows: a model tree has the id of its model, a physical properties tree names it
function viewModelId(view: { readonly id: string; readonly model_id?: string }): string {
  return view.model_id ?? view.id;
}

// Files being imported are listed in their type group, created for them when no data of that type exists yet
function withPendingImports<Child extends TreeNode, Pending extends TreeNode & GeodeObjectTyped>(
  groups: readonly TreeGroup<Child>[],
  pendingImports: readonly Pending[],
): TreeGroup<Child | Pending>[] {
  const merged: TreeGroup<Child | Pending>[] = groups.map((group) => ({
    ...group,
    children: [...group.children],
  }));
  for (const pending of pendingImports) {
    const group = merged.find((candidate) => candidate.id === pending.geode_object_type);
    if (group) {
      group.children.push(pending);
    } else {
      merged.push({
        id: pending.geode_object_type,
        title: pending.geode_object_type,
        children: [pending],
      });
    }
  }
  return merged;
}

export {
  MODEL_TREE_COLORS,
  compareSelections,
  nextModelTreeColor,
  physicalPropertiesViewId,
  viewModelId,
  withPendingImports,
};
export type {
  DataMenuPayload,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
