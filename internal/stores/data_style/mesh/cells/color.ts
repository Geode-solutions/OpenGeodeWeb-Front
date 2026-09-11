// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.color;

export function useMeshCellsColorStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsColor(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).constant;
  }
  function setMeshCellsColor(id, color) {
    const params = { id, color };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshCellsCommonStyle.mutateMeshCellsColoring(id, {
            constant: color,
          }),
      },
    );
  }

  return {
    meshCellsColor,
    setMeshCellsColor,
  };
}
