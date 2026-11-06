import type { BasemapSnapshot } from "@ogw_front/stores/basemap";
import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { CameraSnapshot } from "@ogw_internal/stores/hybrid_viewer/camera";
import type { DataStyleSnapshot } from "@ogw_front/stores/data_style";
import type { LegacyDataId } from "@ogw_front/utils/legacy_data_id";
import type { ModelComponentRecord } from "@ogw_front/stores/data_helpers/mesh.js";
import type { ModelComponentRelationRecord } from "@ogw_front/stores/data_helpers/relations";
import type { NewDataItem } from "@ogw_front/stores/data";
import type { TreeviewSnapshot } from "@ogw_front/stores/treeview";

// Projects saved before data_id existed hold the data id of their rows as `id`
interface ProjectDataSnapshot {
  items: (LegacyDataId<NewDataItem> | NewDataItem)[];
  modelComponents: (LegacyDataId<ModelComponentRecord> | ModelComponentRecord)[];
  modelComponentsRelations: (
    | LegacyDataId<ModelComponentRelationRecord>
    | ModelComponentRelationRecord
  )[];
}

interface ProjectSnapshot {
  treeview?: TreeviewSnapshot;
  data?: ProjectDataSnapshot;
  hybridViewer?: CameraSnapshot;
  dataStyle?: DataStyleSnapshot;
  crs?: { projectCrs?: CRSList };
  basemap?: BasemapSnapshot;
}

export type { ProjectSnapshot };
