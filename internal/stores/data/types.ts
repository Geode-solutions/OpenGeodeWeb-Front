import type { CreationDate, DataName, LightViewable } from "@ogw_front/types/data";
import type {
  DataIdentified,
  GeodeIdentified,
  GeodeObjectTyped,
  ViewerObjectTyped,
} from "@ogw_front/types/identifiers";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { Count } from "@ogw_front/types/ui";
import type { DataItem } from "@ogw_internal/database/tables/data";
import type { ModelComponentInput } from "@ogw_internal/stores/data/model/types";

// What the CRS features read of a data: light to copy on each change
type CrsItem = Pick<DataItem, "data_id" | "name" | "crs" | "created_at">;

interface NewDataItem extends DataIdentified, GeodeIdentified, GeodeObjectTyped, ViewerObjectTyped {
  name?: DataName;
  is_viewable?: boolean;
  binary_light_viewable?: LightViewable;
  crs?: CRS;
  // Set on saved data: kept by the project snapshot
  created_at?: CreationDate;
  mesh_components?: ModelComponentInput[];
  collection_components?: ModelComponentInput[];
  nb_vertices?: Count;
}

export type { CrsItem, NewDataItem };
