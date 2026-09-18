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
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPointsCommonStyle.meshPointsStyle(id).visibility as boolean | undefined;
  }
  async function setMeshPointsVisibility(
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
        response_function: async (response: unknown) => {
          // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the viewer schema.
          const typedResponse = response as { id: string; visibility: boolean };
          const mutateResult =
            await meshPointsCommonStyle.mutateMeshPointsVisibility(typedResponse);
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
