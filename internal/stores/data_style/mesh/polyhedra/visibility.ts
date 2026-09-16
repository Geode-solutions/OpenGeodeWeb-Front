// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.visibility;

export function useMeshPolyhedraVisibilityStyle(): {
  meshPolyhedraVisibility: (id: string) => boolean | undefined;
  setMeshPolyhedraVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVisibility(id: string): boolean | undefined {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).visibility as boolean | undefined;
  }
  async function setMeshPolyhedraVisibility(
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
          const mutation_result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
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
