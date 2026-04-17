import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

export function useModelCornersColor() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();

  function setModelCornersColor(modelId, componentIds, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(
      modelId,
      componentIds,
      color,
      schema,
      {
        dataStore,
        viewerStore,
      },
      color_mode,
    );
  }

  return { setModelCornersColor };
}
