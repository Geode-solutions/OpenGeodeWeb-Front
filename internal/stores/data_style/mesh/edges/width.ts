// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.width;

export function useMeshEdgesWidthStyle(): {
  meshEdgesWidth: (id: string) => number | undefined;
  setMeshEdgesWidth: (id: string, width: number | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesWidth(id: string): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- width is defined as number in the data style schema.
    return meshEdgesCommonStyle.meshEdgesStyle(id).width as number | undefined;
  }
  async function setMeshEdgesWidth(id: string, width: number | undefined): Promise<unknown> {
    const params = { id, width };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesStyle(id, { width });
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
