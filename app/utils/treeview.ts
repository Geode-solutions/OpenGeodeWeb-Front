import type {
  GeodeObjectTyped,
  ModelComponentId,
  ModelIdentified,
} from "@ogw_front/types/identifiers";
import type { TreeGroup, TreeNode } from "@ogw_front/types/tree";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import { isBasemapId } from "@ogw_front/utils/basemap_tree";

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
  itemId: DataId;
  context_type?: undefined;
}

interface GeodeObjectTypeMenuPayload {
  event: MouseEvent;
  itemId: string;
  context_type: "geode_object_type";
  targetIds: DataId[];
}

interface ModelComponentMenuPayload extends ModelIdentified {
  event: MouseEvent;
  itemId: string;
  context_type: "model_component" | "model_component_type";
  modelComponentType?: string;
  targetComponentIds?: ModelComponentId[];
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

// In the objects tree, a data row follows its data. The basemap rows and the groups of data types
// Always show their toggle, except the group of horizon stacks, which open their own modal
function isObjectTreeRowViewable(
  row: DisplayItem,
  isDataViewable: (dataId: DataId) => boolean,
): boolean {
  const { id, title } = row.raw;
  if (typeof id !== "string" || isBasemapId(id)) {
    return true;
  }
  if (row.isLeaf) {
    return isDataViewable(id);
  }
  return title !== "HorizonStack3D";
}

export {
  MODEL_TREE_COLORS,
  compareSelections,
  isObjectTreeRowViewable,
  nextModelTreeColor,
  withPendingImports,
};
export type {
  DataMenuPayload,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
