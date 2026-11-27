// Local imports
import type { CameraPositionId, CameraPositionName } from "@ogw_internal/database/types";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";
import type { CameraPositionRecord } from "@ogw_internal/database/tables/camera_positions";
import { cameraPositionsDb } from "@ogw_internal/database/database.js";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useObservable } from "@vueuse/rxjs";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
// oxlint-disable-next-line max-lines-per-function
export const useCameraManagerStore = defineStore("cameraManager", () => {
  const viewerStore = useViewerStore();
  // Keyed by an auto-incremented number
  const cameraPositionsTable = cameraPositionsDb();

  function refAllCameraPositions(): Ref<CameraPositionRecord[]> {
    return useObservable(
      liveObservable(async () => {
        const positions = await cameraPositionsTable.toArray();
        return positions;
      }),
      { initialValue: [] as CameraPositionRecord[] },
    );
  }

  async function getCameraPosition(
    id: CameraPositionId,
  ): Promise<CameraPositionRecord | undefined> {
    const position = await cameraPositionsTable.get(id);
    return position;
  }

  async function saveCameraPosition(
    name: CameraPositionName,
    camera_options: CameraOptions,
  ): Promise<void> {
    await cameraPositionsTable.put({
      name,
      camera_options,
    });
  }

  async function restoreCameraPosition(id: CameraPositionId): Promise<void> {
    const position = await cameraPositionsTable.get(id);
    if (position) {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
      const params = { camera_options: position.camera_options };
      await viewerStore.request({ schema, params });
    }
  }

  async function deleteCameraPosition(id: CameraPositionId): Promise<void> {
    await cameraPositionsTable.delete(id);
  }

  async function renameCameraPosition(
    id: CameraPositionId,
    newName: CameraPositionName,
  ): Promise<void> {
    await cameraPositionsTable.update(id, { name: newName });
  }

  return {
    refAllCameraPositions,
    getCameraPosition,
    saveCameraPosition,
    restoreCameraPosition,
    deleteCameraPosition,
    renameCameraPosition,
  };
});
