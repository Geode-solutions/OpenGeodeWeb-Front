// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines;

export function useModelLinesColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();

  function modelLineColor(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).color;
  }

  function setModelLinesColor(id, line_ids, color, color_mode = "constant") {
    if (!line_ids || line_ids.length === 0) {
      return Promise.resolve();
    }
    return dataStore.getMeshComponentsViewerIds(id, line_ids).then((line_viewer_ids) => {
      if (!line_viewer_ids || line_viewer_ids.length === 0) {
        return modelLinesCommonStyle.mutateModelLinesStyle(id, line_ids, { color, color_mode });
      }
      const params = { id, block_ids: line_viewer_ids, color_mode };
      if (color_mode === "constant") {
        params.color = color;
      }
      return viewerStore.request(model_lines_schemas.color, params, {
        response_function: () =>
          modelLinesCommonStyle.mutateModelLinesStyle(id, line_ids, { color, color_mode }),
      });
    });
  }

  return { modelLineColor, setModelLinesColor };
}
