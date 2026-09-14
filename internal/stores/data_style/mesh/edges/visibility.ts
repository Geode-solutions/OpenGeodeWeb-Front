// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.visibility;

export function useMeshEdgesVisibilityStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesVisibility(id: string): boolean | undefined {
    return meshEdgesCommonStyle.meshEdgesStyle(id).visibility as boolean | undefined;
  }
  function setMeshEdgesVisibility(id: string, visibility: boolean | undefined) {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => meshEdgesCommonStyle.mutateMeshEdgesStyle(id, { visibility }),
      },
    );
  }

  return {
    meshEdgesVisibility,
    setMeshEdgesVisibility,
  };
}
