import type { DataIdentified, ModelComponentId } from "@ogw_front/types/identifiers";
import type { ModelComponentRelationType } from "@ogw_front/types/model";
import type { TableDefinition } from "./table_definition";

interface ModelComponentRelationRecord extends DataIdentified {
  parent: ModelComponentId;
  child: ModelComponentId;
  type: ModelComponentRelationType;
}

const modelComponentsRelationTable: TableDefinition = {
  name: "model_components_relation",
  schema: "[data_id+parent+child], data_id, type",
};

export { modelComponentsRelationTable };
export type { ModelComponentRelationRecord };
