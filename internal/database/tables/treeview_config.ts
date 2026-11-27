import type { CssColor, Pixels, Title } from "@ogw_front/types/ui";
import type { GeodeObjectTyped, TreeNodeId, TreeViewId } from "@ogw_front/types/identifiers";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { TableDefinition } from "./table_definition";
import type { TreeviewConfigId } from "@ogw_internal/database/types";

interface OpenedView extends Partial<GeodeObjectTyped> {
  type: "object" | "component";
  id: TreeViewId;
  title: Title;
  scrollTop: Pixels;
  opened: TreeNodeId[];
  // Ties a model tree to its row in the objects tree
  color?: CssColor;
  // A model tree reduced to its button in the activity bar: still open, with its state kept
  collapsed?: boolean;
}

interface TreeviewConfigRecord {
  id: TreeviewConfigId;
  opened_views: OpenedView[];
  panelWidth: Pixels;
  additionalPanelWidth: Pixels;
  selectionIds: DataId[];
  rowHeights: Pixels[];
}

const treeviewConfigTable: TableDefinition = {
  name: "treeview_config",
  schema: "id",
};

export { treeviewConfigTable };
export type { OpenedView, TreeviewConfigRecord };
