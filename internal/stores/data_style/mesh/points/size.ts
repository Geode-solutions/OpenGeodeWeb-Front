// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.size;

export function useMeshPointsSizeStyle(): {
  meshPointsSize: (id: string) => number | undefined;
  setMeshPointsSize: (id: string, size: number | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsSize(id: string): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- size is defined as number in the data style schema.
    return meshPointsCommonStyle.meshPointsStyle(id).size as number | undefined;
  }
  async function setMeshPointsSize(id: string, size: number | undefined): Promise<unknown> {
    const params = { id, size };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsStyle(id, { size });
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
