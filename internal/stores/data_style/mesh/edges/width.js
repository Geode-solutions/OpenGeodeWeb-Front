// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.width;

export function useMeshEdgesWidthStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesWidth(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).width;
  }
  function setMeshEdgesWidth(id, width) {
    const params = { id, width };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => meshEdgesCommonStyle.mutateMeshEdgesStyle(id, { width }),
      },
    );
  }

  return {
    meshEdgesWidth,
    setMeshEdgesWidth,
  };
}
