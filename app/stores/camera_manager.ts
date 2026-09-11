// Third party imports
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { database } from "@ogw_internal/database/database.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

export const useCameraManagerStore = defineStore("camera_manager", () => {
  const viewerStore = useViewerStore();
  const camera_positions_db = database.camera_positions;

  function refAllCameraPositions() {
    return useObservable(
      liveQuery(() => camera_positions_db.toArray()),
      { initialValue: [] },
    );
  }

  async function getCameraPosition(id) {
    return await camera_positions_db.get(id);
  }

  async function saveCameraPosition(name, camera_options) {
    await camera_positions_db.put({
      name,
      camera_options,
    });
  }

  async function restoreCameraPosition(id) {
    const position = await camera_positions_db.get(id);
    if (position) {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
      const params = { camera_options: position.camera_options };
      await viewerStore.request({ schema, params });
    }
  }

  async function deleteCameraPosition(id) {
    await camera_positions_db.delete(id);
  }

  async function renameCameraPosition(id, newName) {
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
