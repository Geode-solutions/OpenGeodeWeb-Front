import type { Table } from "dexie";
import { useObservable } from "@vueuse/rxjs";

// Local imports
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";
import { database } from "@ogw_internal/database/database.js";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface CameraPositionRecord {
  id?: number;
  name: string;
  camera_options: CameraOptions;
}

// oxlint-disable-next-line max-lines-per-function
export const useCameraManagerStore = defineStore("camera_manager", () => {
  const viewerStore = useViewerStore();
  // Database's table map is assembled dynamically at runtime (see internal/database/database.ts),
  // So it's typed as `{}`; this store's table is registered before use, hence the cast.
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted database table boundary.
  const camera_positions_db = database.camera_positions as unknown as Table<
    CameraPositionRecord,
    number
  >;

  function refAllCameraPositions(): Ref<CameraPositionRecord[]> {
    return useObservable(
      liveObservable(async () => {
        const positions = await camera_positions_db.toArray();
        return positions;
      }),
      { initialValue: [] as CameraPositionRecord[] },
    );
  }

  async function getCameraPosition(id: number): Promise<CameraPositionRecord | undefined> {
    const position = await camera_positions_db.get(id);
    return position;
  }

  async function saveCameraPosition(name: string, camera_options: CameraOptions): Promise<void> {
    await camera_positions_db.put({
      name,
      camera_options,
    });
  }

  async function restoreCameraPosition(id: number): Promise<void> {
    const position = await camera_positions_db.get(id);
    if (position) {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
      const params = { camera_options: position.camera_options };
      await viewerStore.request({ schema, params });
    }
  }

  async function deleteCameraPosition(id: number): Promise<void> {
    await camera_positions_db.delete(id);
  }

  async function renameCameraPosition(id: number, newName: string): Promise<void> {
    await camera_positions_db.update(id, { name: newName });
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
