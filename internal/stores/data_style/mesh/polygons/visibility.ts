// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.visibility;

export function useMeshPolygonsVisibilityStyle(): {
  meshPolygonsVisibility: (meshId: MeshId) => boolean | undefined;
  setMeshPolygonsVisibility: (meshId: MeshId, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsVisibility(meshId: MeshId): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsStyle(meshId).visibility as boolean | undefined;
  }
  async function setMeshPolygonsVisibility(meshId: MeshId, visibility: boolean): Promise<unknown> {
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(meshId, {
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
