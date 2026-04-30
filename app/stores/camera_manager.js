// Third party imports
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { database } from "@ogw_internal/database/database.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

export const useCameraManagerStore = defineStore("camera_manager", () => {
  const viewerStore = useViewerStore();

  function refAllCameraPositions() {
    return useObservable(
      liveQuery(() => database.camera_positions.toArray()),
      { initialValue: [] },
    );
  }
 
  async function getCameraPosition(id) {
    return await database.camera_positions.get(id);
  }

  async function saveCameraPosition(name, camera_options, object_id = undefined) {
    await database.camera_positions.put({
      name,
      object_id,
      camera_options,
    });
  }

  async function restoreCameraPosition(id) {
    const position = await database.camera_positions.get(id);
    if (position) {
      await viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.update_camera, {
        camera_options: position.camera_options,
      });
    }
  }

  async function deleteCameraPosition(id) {
    await database.camera_positions.delete(id);
  }

  async function renameCameraPosition(id, newName) {
    await database.camera_positions.update(id, { name: newName });
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
