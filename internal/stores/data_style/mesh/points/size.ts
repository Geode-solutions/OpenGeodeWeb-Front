// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.size;

export function useMeshPointsSizeStyle(): {
  meshPointsSize: (meshId: MeshId) => number | undefined;
  setMeshPointsSize: (meshId: MeshId, size: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsSize(meshId: MeshId): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- size is defined as number in the data style schema.
    return meshPointsCommonStyle.meshPointsStyle(meshId).size as number | undefined;
  }
  async function setMeshPointsSize(meshId: MeshId, size: number): Promise<unknown> {
    const params = { id: meshId, size };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsStyle(meshId, { size });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPointsSize,
    setMeshPointsSize,
  };
}
