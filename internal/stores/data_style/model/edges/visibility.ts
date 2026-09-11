// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useModelEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.visibility;

export function useModelEdgesVisibilityStyle() {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();

  function modelEdgesVisibility(id) {
    return modelEdgesCommonStyle.modelEdgesStyle(id).visibility;
  }

  function setModelEdgesVisibility(id, visibility) {
    const params = { id, visibility };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => modelEdgesCommonStyle.mutateModelEdgesStyle(id, { visibility }),
      },
    );
  }

  function applyModelEdgesStyle(id) {
    const visibility = modelEdgesVisibility(id);
    return Promise.resolve([setModelEdgesVisibility(id, visibility)]);
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
  };
}
