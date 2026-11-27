import type { GeodeObjectTyped } from "@ogw_front/types/identifiers";
import type { TableDefinition } from "./table_definition";

interface OpenedView extends Partial<GeodeObjectTyped> {
  // The objects tree, the model tree (mesh components) of a model, or its physical properties
  type: "object" | "component" | "physical_properties";
  id: string;
  // The model of a physical properties tree: a model tree has the id of its model
  model_id?: string;
  title: string;
  scrollTop: number;
  opened: string[];
  // Ties a model tree to its row in the objects tree
  color?: string;
  // A model tree reduced to its button in the activity bar: still open, with its state kept
  collapsed?: boolean;
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
