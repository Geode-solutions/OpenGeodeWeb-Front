import type { TableDefinition } from "./table_definition";

export const modelPhysicalPropertiesTable: TableDefinition = {
  name: "model_physical_properties",
  schema: "[data_id+name], data_id",
};
