// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import type { EdgeWidth } from "@geode/opengeodeweb-viewer/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.width;

export function useMeshEdgesWidthStyle(): {
  meshEdgesWidth: (meshId: MeshId) => EdgeWidth | undefined;
  setMeshEdgesWidth: (meshId: MeshId, width: EdgeWidth) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesWidth(meshId: MeshId): EdgeWidth | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- width is defined as number in the data style schema.
    return meshEdgesCommonStyle.meshEdgesStyle(meshId).width as EdgeWidth | undefined;
  }
  async function setMeshEdgesWidth(meshId: MeshId, width: EdgeWidth): Promise<unknown> {
    const params = { id: meshId, width };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesStyle(meshId, { width });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshEdgesWidth,
    setMeshEdgesWidth,
  };
}
