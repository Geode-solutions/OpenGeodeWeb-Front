// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import type { Visibility } from "@ogw_front/types/style";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.visibility;

export function useMeshPolyhedraVisibilityStyle(): {
  meshPolyhedraVisibility: (meshId: MeshId) => Visibility | undefined;
  setMeshPolyhedraVisibility: (meshId: MeshId, visibility: Visibility) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVisibility(meshId: MeshId): Visibility | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(meshId).visibility as Visibility | undefined;
  }
  async function setMeshPolyhedraVisibility(
    meshId: MeshId,
    visibility: Visibility,
  ): Promise<unknown> {
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutation_result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(meshId, {
            visibility,
          });
          return mutation_result;
        },
      },
    );
    return result;
  }

  return {
    meshPolyhedraVisibility,
    setMeshPolyhedraVisibility,
  };
}
