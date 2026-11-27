import type { DataIdentified } from "@ogw_front/types/identifiers";
import type { TableDefinition } from "./table_definition";

interface ModelComponentRelationRecord extends DataIdentified {
  parent: string;
  child: string;
  type: string;
}

const modelComponentsRelationTable: TableDefinition = {
  name: "model_components_relation",
  schema: "[data_id+parent+child], data_id, type",
};

export { modelComponentsRelationTable };
export type { ModelComponentRelationRecord };
