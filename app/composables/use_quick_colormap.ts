import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

export function useQuickColormap() {
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
      const result = (await viewerStore.request({ schema, params })) as
        | { data_id?: string }
        | undefined;
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
