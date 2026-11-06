// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.visibility;

export function useMeshEdgesVisibilityStyle(): {
  meshEdgesVisibility: (meshId: MeshId) => boolean | undefined;
  setMeshEdgesVisibility: (meshId: MeshId, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesVisibility(meshId: MeshId): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshEdgesCommonStyle.meshEdgesStyle(meshId).visibility as boolean | undefined;
  }
  async function setMeshEdgesVisibility(meshId: MeshId, visibility: boolean): Promise<unknown> {
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesStyle(meshId, {
            visibility,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshEdgesVisibility,
    setMeshEdgesVisibility,
  };
}
