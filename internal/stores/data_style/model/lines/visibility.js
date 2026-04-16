// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines;

export function useModelLinesVisibilityStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelLineVisibility(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).visibility;
  }

  function setModelLinesVisibility(id, line_ids, visibility) {
    return dataStyleState
      .setModelTypeVisibility(id, line_ids, visibility, model_lines_schemas.visibility, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelLinesCommonStyle.mutateModelLinesStyle(id, line_ids, {
            visibility,
          });
        }
        return res;
      });
  }

  return {
    modelLineVisibility,
    setModelLinesVisibility,
  };
}
