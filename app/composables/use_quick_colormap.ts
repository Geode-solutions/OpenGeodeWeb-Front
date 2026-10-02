import { consola } from "consola";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

export function useQuickColormap(): {
  pickColormap: typeof pickColormap;
  quickColormap: typeof quickColormap;
} {
  const viewerStore = useViewerStore();
  const quickColormap = reactive<{
    data_id: string | undefined;
    show: boolean;
    x: number;
    y: number;
  }>({
    data_id: undefined,
    show: false,
    x: 0,
    y: 0,
  });

  async function pickColormap(
    offsetX: number,
    offsetY: number,
    clientX: number,
    clientY: number,
  ): Promise<boolean> {
    try {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.pick_colormap;
      const params = { x: offsetX, y: offsetY };
      const { data_id } = await viewerStore.request({ schema, params });
      if (data_id !== undefined && data_id !== "") {
        quickColormap.data_id = data_id;
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
