// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines;

export function useModelLinesVisibilityStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  function modelLineVisibility(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).visibility;
  }
  function setModelLinesVisibility(id, line_ids, visibility) {
    if (!line_ids || line_ids.length === 0) {
      return Promise.resolve()
    }

    return dataStore
      .getMeshComponentsViewerIds(id, line_ids)
      .then((line_viewer_ids) => {
        if (!line_viewer_ids || line_viewer_ids.length === 0) {
          return modelLinesCommonStyle.mutateModelLinesStyle(id, line_ids, {
            visibility,
          })
        }
        return viewerStore.request(
          model_lines_schemas.visibility,
          { id, block_ids: line_viewer_ids, visibility },
          {
            response_function: () => {
              return modelLinesCommonStyle.mutateModelLinesStyle(id, line_ids, {
                visibility,
              })
            },
          },
        )
      })
  }

  return {
    modelLineVisibility,
    setModelLinesVisibility,
  };
}
