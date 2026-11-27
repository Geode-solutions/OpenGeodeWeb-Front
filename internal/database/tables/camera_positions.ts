import type { CameraPositionId, CameraPositionName } from "@ogw_internal/database/types";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";
import type { TableDefinition } from "./table_definition";

interface CameraPositionRecord {
  id?: CameraPositionId;
  name: CameraPositionName;
  camera_options: CameraOptions;
}

const cameraPositionsTable: TableDefinition = {
  name: "camera_positions",
  schema: "++id, name",
};

export { cameraPositionsTable };
export type { CameraPositionRecord };
