import type { CreationDate, DataName, LightViewable } from "@ogw_front/types/data";
import type {
  DataIdentified,
  GeodeIdentified,
  GeodeObjectTyped,
  ViewerObjectTyped,
} from "@ogw_front/types/identifiers";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { TableDefinition } from "./table_definition";

interface DataItem extends DataIdentified, GeodeIdentified, GeodeObjectTyped, ViewerObjectTyped {
  name: DataName;
  visible: boolean;
  created_at: CreationDate;
  is_viewable?: boolean;
  binary_light_viewable?: LightViewable;
  crs?: CRS;
}

const dataTable: TableDefinition = {
  name: "data",
  schema:
    "data_id, geode_id, name, viewer_object_type, geode_object_type, visible, created_at, binary_light_viewable",
};

export { dataTable };
export type { DataItem };
