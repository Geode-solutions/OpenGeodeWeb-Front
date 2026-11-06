// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.visibility;

export function useMeshCellsVisibilityStyle(): {
  meshCellsVisibility: (meshId: MeshId) => boolean | undefined;
  setMeshCellsVisibility: (meshId: MeshId, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsVisibility(meshId: MeshId): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshCellsCommonStyle.meshCellsStyle(meshId).visibility as boolean | undefined;
  }
  async function setMeshCellsVisibility(meshId: MeshId, visibility: boolean): Promise<unknown> {
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsStyle(meshId, {
            visibility,
          });
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
