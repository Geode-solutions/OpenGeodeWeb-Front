// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.visibility;

export function useMeshPolyhedraVisibilityStyle(): {
  meshPolyhedraVisibility: (meshId: MeshId) => boolean | undefined;
  setMeshPolyhedraVisibility: (meshId: MeshId, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVisibility(meshId: MeshId): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(meshId).visibility as boolean | undefined;
  }
  async function setMeshPolyhedraVisibility(meshId: MeshId, visibility: boolean): Promise<unknown> {
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
