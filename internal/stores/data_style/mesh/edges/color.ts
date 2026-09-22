// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.color;

export function useMeshEdgesColorStyle(): {
  meshEdgesColor: (id: string) => unknown;
  setMeshEdgesColor: (id: string, color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColor(id: string): unknown {
    return meshEdgesCommonStyle.meshEdgesColoring(id).constant;
  }
  async function setMeshEdgesColor(id: string, color: unknown): Promise<unknown> {
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesColoring(id, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshEdgesColor,
    setMeshEdgesColor,
  };
}
