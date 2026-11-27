import type { BlockIds } from "@geode/opengeodeweb-viewer/schema_types";
import type { Coordinate } from "@ogw_front/types/geometry";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { consola } from "consola";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

export function useQuickColormap(): {
  pickColormap: typeof pickColormap;
  quickColormap: typeof quickColormap;
} {
  const viewerStore = useViewerStore();
  const quickColormap = reactive<{
    data_id: DataId | undefined;
    block_ids: BlockIds | undefined;
    show: boolean;
    x: Coordinate;
    y: Coordinate;
  }>({
    data_id: undefined,
    block_ids: undefined,
    show: false,
    x: 0,
    y: 0,
  });

  async function pickColormap(
    offsetX: Coordinate,
    offsetY: Coordinate,
    clientX: Coordinate,
    clientY: Coordinate,
  ): Promise<boolean> {
    try {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.pick_colormap;
      const params = { x: offsetX, y: offsetY };
      const { data_id, block_ids } = await viewerStore.request({ schema, params });
      if (data_id !== undefined && data_id !== "") {
        quickColormap.data_id = data_id;
        quickColormap.block_ids = block_ids;
        quickColormap.x = clientX;
        quickColormap.y = clientY;
        quickColormap.show = true;
        return true;
      }
    } catch (error) {
      consola.error("Error picking colormap:", error);
    }
    return false;
  }

  return { pickColormap, quickColormap };
}
