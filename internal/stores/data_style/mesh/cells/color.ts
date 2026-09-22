// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.color;

export function useMeshCellsColorStyle(): {
  meshCellsColor: (id: string) => unknown;
  setMeshCellsColor: (id: string, color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsColor(id: string): unknown {
    return meshCellsCommonStyle.meshCellsColoring(id).constant;
  }
  async function setMeshCellsColor(id: string, color: unknown): Promise<unknown> {
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsColoring(id, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshCellsColor,
    setMeshCellsColor,
  };
}
