// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.color;

export function useMeshPointsColorStyle(): {
  meshPointsColor: (id: string) => unknown;
  setMeshPointsColor: (id: string, color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsColor(id: string): unknown {
    return meshPointsCommonStyle.meshPointsColoring(id).constant;
  }
  async function setMeshPointsColor(id: string, color: unknown): Promise<unknown> {
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsColoring(id, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPointsColor,
    setMeshPointsColor,
  };
}
