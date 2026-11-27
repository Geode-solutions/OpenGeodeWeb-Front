import type { GeodeObjectTyped, ModelIdentified } from "@ogw_front/types/identifiers";
import type { TreeGroup, TreeNode } from "@ogw_front/types/tree";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import { geodeObjectImage } from "@ogw_front/assets/geode_objects";
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

// The header and the activity bar button of a model tree: the model with its type icon, or its
// Physical properties with the flask
interface ViewHeader {
  title: string;
  // Named in the tooltips of the activity bar button
  label: string;
  icon: string | undefined;
  fontIcon: string | undefined;
}

function viewHeader(view: {
  readonly type: string;
  readonly title: string;
  readonly geode_object_type?: GeodeObjectType;
}): ViewHeader {
  if (view.type === "physical_properties") {
    return {
      title: "Physical properties",
      label: `the physical properties of ${view.title}`,
      icon: undefined,
      fontIcon: "ph-flask",
    };
  }
  let icon: string | undefined = undefined;
  if (view.geode_object_type !== undefined) {
    icon = geodeObjectImage(view.geode_object_type);
  }
  return { title: view.title, label: view.title, icon, fontIcon: undefined };
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

// In the objects tree, a data row follows its data. The basemap rows and the groups of data types
// Always show their toggle, except the group of horizon stacks, which open their own modal
function isObjectTreeRowViewable(
  row: DisplayItem,
  isDataViewable: (dataId: string) => boolean,
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
  physicalPropertiesViewId,
  viewHeader,
  viewModelId,
  withPendingImports,
};
export type {
  DataMenuPayload,
  ViewHeader,
  GeodeObjectTypeMenuPayload,
  ModelComponentMenuPayload,
  TreeMenuPayload,
};
