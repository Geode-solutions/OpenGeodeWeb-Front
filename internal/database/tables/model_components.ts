import type { DataIdentified, GeodeIdentified } from "@ogw_front/types/identifiers";
import type { TableDefinition } from "./table_definition";

interface ModelComponentRecord extends DataIdentified, GeodeIdentified {
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
}

const modelComponentsTable: TableDefinition = {
  name: "model_components",
  schema: "[data_id+geode_id], data_id, [data_id+type], viewer_id, name, is_active",
};

export { modelComponentsTable };
export type { ModelComponentRecord };
