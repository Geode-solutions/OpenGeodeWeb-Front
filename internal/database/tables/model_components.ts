import type { TableDefinition } from "./table_definition";

export const modelComponentsTable: TableDefinition = {
  name: "model_components",
  schema: "[id+geode_id], id, [id+type], viewer_id, name, is_active",
};
