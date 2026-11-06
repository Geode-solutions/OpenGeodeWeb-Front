import type { TableDefinition } from "./table_definition";

export const modelComponentsRelationTable: TableDefinition = {
  name: "model_components_relation",
  schema: "[data_id+parent+child], data_id, type",
};
