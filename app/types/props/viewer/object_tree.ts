import type { CssColor, Title } from "@ogw_front/types/ui";
import type { ComponentRelations } from "@ogw_internal/stores/data/model/relations";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import type { ModelComponentType } from "@ogw_front/types/model";
import type { TreeNodeId } from "@ogw_front/types/identifiers";
import type { ViewerId } from "@geode/opengeodeweb-viewer/schema_types";

// A row tinted from outside the tree, e.g. while its model tree header is hovered
interface LinkedTreeRow {
  id: TreeNodeId;
  color: CssColor;
}

// What a tree row sends when the pointer enters or leaves it
interface TreeRowHoverPayload<Item = DisplayItem> {
  item: Item;
  immediate?: boolean;
}

// A row of a model tree: a component, a type of components or a group of related components
interface ModelTreeItem {
  raw?: ModelTreeItem;
  id: TreeNodeId;
  category?: ModelComponentType;
  children?: ModelTreeItem[];
  relation?: keyof ComponentRelations;
  viewer_id?: ViewerId;
  title?: Title;
}

export type { LinkedTreeRow, ModelTreeItem, TreeRowHoverPayload };
