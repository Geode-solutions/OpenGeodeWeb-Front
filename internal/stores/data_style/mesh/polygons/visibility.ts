// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.visibility;

export function useMeshPolygonsVisibilityStyle(): {
  meshPolygonsVisibility: (id: string) => boolean | undefined;
  setMeshPolygonsVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsVisibility(id: string): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).visibility as boolean | undefined;
  }
  async function setMeshPolygonsVisibility(
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
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
            visibility,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPolygonsVisibility,
    setMeshPolygonsVisibility,
  };
}
