// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import type { DataId } from "@ogw_front/types/identifiers";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.width;

export function useMeshEdgesWidthStyle(): {
  meshEdgesWidth: (meshId: DataId) => number | undefined;
  setMeshEdgesWidth: (meshId: DataId, width: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesWidth(meshId: DataId): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- width is defined as number in the data style schema.
    return meshEdgesCommonStyle.meshEdgesStyle(meshId).width as number | undefined;
  }
  async function setMeshEdgesWidth(meshId: DataId, width: number): Promise<unknown> {
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
