// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.color;

export function useMeshPolyhedraColorStyle(): {
  meshPolyhedraColor: (id: string) => unknown;
  setMeshPolyhedraColor: (id: string, color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraColor(id: string): unknown {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).constant;
  }
  async function setMeshPolyhedraColor(id: string, color: unknown): Promise<unknown> {
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutation_result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraColoring(id, {
            constant: color,
          });
          return mutation_result;
        },
      },
    );
    return result;
  }

  return {
    meshPolyhedraColor,
    setMeshPolyhedraColor,
  };
}
