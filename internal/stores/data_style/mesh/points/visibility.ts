// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import type { Visibility } from "@ogw_front/types/style";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.visibility;

export function useMeshPointsVisibilityStyle(): {
  meshPointsVisibility: (meshId: MeshId) => Visibility | undefined;
  setMeshPointsVisibility: (meshId: MeshId, visibility: Visibility) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVisibility(meshId: MeshId): Visibility | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPointsCommonStyle.meshPointsStyle(meshId).visibility as Visibility | undefined;
  }
  async function setMeshPointsVisibility(meshId: MeshId, visibility: Visibility): Promise<unknown> {
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async (response) => {
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsVisibility(response);
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPointsVisibility,
    setMeshPointsVisibility,
  };
}
