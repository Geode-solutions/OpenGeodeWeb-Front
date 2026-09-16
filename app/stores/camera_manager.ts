import { type Table, liveQuery } from "dexie";
import type { Observable } from "rxjs";
import { useObservable } from "@vueuse/rxjs";

// Local imports
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";
import { database } from "@ogw_internal/database/database.js";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

interface CameraPositionRecord {
  id?: number;
  name: string;
  camera_options: CameraOptions;
}

export const useCameraManagerStore = defineStore("camera_manager", () => {
  const viewerStore = useViewerStore();
  const camera_positions_db = database.camera_positions as unknown as Table<
    CameraPositionRecord,
    number
  >;

  function refAllCameraPositions(): Readonly<Ref<CameraPositionRecord[]>> {
    // Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
    // Actual rxjs Observable instance (useObservable's declared parameter type);
    // The two are structurally close enough at runtime (vueuse only calls
    // `.subscribe`) but not identical, hence the cast.
    return useObservable(
      liveQuery(async () => camera_positions_db.toArray()) as unknown as Observable<
        CameraPositionRecord[]
      >,
      { initialValue: [] as CameraPositionRecord[] },
    );
  }

  async function getCameraPosition(id: number): Promise<CameraPositionRecord | undefined> {
    return camera_positions_db.get(id);
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
