// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useModelEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.visibility;

export function useModelEdgesVisibilityStyle() {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();

  function modelEdgesVisibility(id: string): boolean | undefined {
    return modelEdgesCommonStyle.modelEdgesStyle(id).visibility as boolean | undefined;
  }

  function setModelEdgesVisibility(id: string, visibility: boolean | undefined) {
    const params = { id, visibility };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => modelEdgesCommonStyle.mutateModelEdgesStyle(id, { visibility }),
      },
    );
  }

  function applyModelEdgesStyle(id: string) {
    const visibility = modelEdgesVisibility(id);
    return Promise.resolve([setModelEdgesVisibility(id, visibility)]);
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
  };
}
