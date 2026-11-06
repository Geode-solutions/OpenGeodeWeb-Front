import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.opacity;

// The opacity is the constant color alpha, the viewer applies it whatever the coloring
export function useMeshPointsOpacityStyle(): {
  meshPointsOpacity: (meshId: MeshId) => number | undefined;
  setMeshPointsOpacity: (meshId: MeshId, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsConstantColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(meshId).constant as RGBAColor | undefined;
  }
  function meshPointsOpacity(meshId: MeshId): number | undefined {
    return meshPointsConstantColor(meshId)?.alpha;
  }
  async function setMeshPointsOpacity(meshId: MeshId, opacity: number): Promise<unknown> {
    const params = { id: meshId, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshPointsConstantColor(meshId);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsColoring(meshId, {
            constant: { ...color, alpha: opacity },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPointsOpacity,
    setMeshPointsOpacity,
  };
}
