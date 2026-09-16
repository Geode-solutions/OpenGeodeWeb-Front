// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.visibility;

export function useMeshPointsVisibilityStyle(): {
  meshPointsVisibility: (id: string) => boolean | undefined;
  setMeshPointsVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVisibility(id: string): boolean | undefined {
    return meshPointsCommonStyle.meshPointsStyle(id).visibility as boolean | undefined;
  }
  async function setMeshPointsVisibility(
    id: string,
    visibility: boolean | undefined,
  ): Promise<unknown> {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        async response_function(response: unknown) {
          return meshPointsCommonStyle.mutateMeshPointsVisibility(
            response as { id: string; visibility: boolean },
          );
        },
      },
    );
  }

  return {
    meshPointsVisibility,
    setMeshPointsVisibility,
  };
}
