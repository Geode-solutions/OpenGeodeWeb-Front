// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.visibility;

export function useMeshCellsVisibilityStyle(): {
  meshCellsVisibility: (id: string) => boolean | undefined;
  setMeshCellsVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsVisibility(id: string): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshCellsCommonStyle.meshCellsStyle(id).visibility as boolean | undefined;
  }
  async function setMeshCellsVisibility(
    id: string,
    visibility: boolean | undefined,
  ): Promise<unknown> {
    const params = { id, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsStyle(id, { visibility });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshCellsVisibility,
    setMeshCellsVisibility,
  };
}
