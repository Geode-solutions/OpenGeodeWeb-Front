// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.visibility;

export function useMeshEdgesVisibilityStyle(): {
  meshEdgesVisibility: (id: string) => boolean | undefined;
  setMeshEdgesVisibility: (id: string, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesVisibility(id: string): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- visibility is defined as boolean in the data style schema.
    return meshEdgesCommonStyle.meshEdgesStyle(id).visibility as boolean | undefined;
  }
  async function setMeshEdgesVisibility(id: string, visibility: boolean): Promise<unknown> {
    const params = { id, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesStyle(id, { visibility });
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
