import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

export function useQuickColormap() {
  const viewerStore = useViewerStore();
  const quickColormap = reactive({
    data_id: undefined,
    show: false,
    x: 0,
    y: 0,
  });

  async function pickColormap(offsetX, offsetY, clientX, clientY) {
    try {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.pick_colormap;
      const params = { x: offsetX, y: offsetY };
      const result = await viewerStore.request({ schema, params });
      if (result && result.data_id) {
        quickColormap.data_id = result.data_id;
        quickColormap.x = clientX;
        quickColormap.y = clientY;
        quickColormap.show = true;
        return true;
      }
    } catch (error) {
      console.error("Error picking colormap:", error);
    }
    return false;
  }

  return { pickColormap, quickColormap };
}
