import type { DataIdentified } from "@ogw_front/types/identifiers";
import type { PhysicalProperty } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { TableDefinition } from "./table_definition";

// One physical property of a model, as the back describes it
interface ModelPhysicalPropertyRecord extends DataIdentified, PhysicalProperty {}

const modelPhysicalPropertiesTable: TableDefinition = {
  name: "model_physical_properties",
  schema: "[data_id+name], data_id",
};

export { modelPhysicalPropertiesTable };
export type { ModelPhysicalPropertyRecord };
