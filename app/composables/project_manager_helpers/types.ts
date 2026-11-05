import type { ModelComponentRelationRecord, NewDataItem } from "@ogw_front/stores/data";
import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { CameraSnapshot } from "@ogw_internal/stores/hybrid_viewer/camera";
import type { DataStyleSnapshot } from "@ogw_front/stores/data_style";
import type { ModelComponentRecord } from "@ogw_front/stores/data_helpers/mesh.js";
import type { TreeviewSnapshot } from "@ogw_front/stores/treeview";

interface ProjectDataSnapshot {
  items: NewDataItem[];
  modelComponents: ModelComponentRecord[];
  modelComponentsRelations: ModelComponentRelationRecord[];
}

interface ProjectSnapshot {
  treeview?: TreeviewSnapshot;
  data?: ProjectDataSnapshot;
  hybridViewer?: CameraSnapshot;
  dataStyle?: DataStyleSnapshot;
  crs?: { projectCrs?: CRSList };
}

export type { ProjectSnapshot };
