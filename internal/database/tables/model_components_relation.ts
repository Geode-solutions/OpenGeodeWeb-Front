import type { TableDefinition } from "./table_definition";

export const modelComponentsRelationTable: TableDefinition = {
  name: "model_components_relation",
  schema: "[id+parent+child], id, type",
};
