import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Runtime guard for the unknown response of viewerStore.request(), used instead of an
// `as` cast so the shape is actually verified (data_id, when present, must be a string).
function isPickColormapResult(value: unknown): value is { data_id?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    (!("data_id" in value) || typeof value.data_id === "string")
  );
}

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
      const result = await viewerStore.request({ schema, params });
      if (isPickColormapResult(result) && result.data_id !== undefined && result.data_id !== "") {
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
