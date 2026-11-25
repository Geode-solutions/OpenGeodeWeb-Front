import type { GeodeObjectTyped } from "@ogw_front/types/identifiers";
import type { TableDefinition } from "./table_definition";

interface OpenedView extends Partial<GeodeObjectTyped> {
  type: "object" | "component";
  id: string;
  title: string;
  scrollTop: number;
  opened: string[];
  // Ties a model tree to its row in the objects tree
  color?: string;
}

interface TreeviewConfigRecord {
  id: string;
  opened_views: OpenedView[];
  panelWidth: number;
  additionalPanelWidth: number;
  selectionIds: string[];
  rowHeights: number[];
}

const treeviewConfigTable: TableDefinition = {
  name: "treeview_config",
  schema: "id",
};

export { treeviewConfigTable };
export type { OpenedView, TreeviewConfigRecord };
