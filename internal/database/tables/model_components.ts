import type { TableDefinition } from "./table_definition";

export const modelComponentsTable: TableDefinition = {
  name: "model_components",
  schema: "[data_id+geode_id], data_id, [data_id+type], viewer_id, name, is_active",
};
