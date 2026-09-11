// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.visibility;

export function useMeshCellsVisibilityStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsVisibility(id) {
    return meshCellsCommonStyle.meshCellsStyle(id).visibility;
  }
  function setMeshCellsVisibility(id, visibility) {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => meshCellsCommonStyle.mutateMeshCellsStyle(id, { visibility }),
      },
    );
  }

  return {
    meshCellsVisibility,
    setMeshCellsVisibility,
  };
}
