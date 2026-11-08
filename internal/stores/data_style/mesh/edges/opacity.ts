import type { MeshId } from "@ogw_front/types/identifiers";
import type { Opacity } from "@ogw_front/types/style";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.opacity;

// The opacity is the constant color alpha, the viewer applies it whatever the coloring
export function useMeshEdgesOpacityStyle(): {
  meshEdgesOpacity: (meshId: MeshId) => Opacity | undefined;
  setMeshEdgesOpacity: (meshId: MeshId, opacity: Opacity) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesConstantColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).constant as RGBAColor | undefined;
  }
  function meshEdgesOpacity(meshId: MeshId): Opacity | undefined {
    return meshEdgesConstantColor(meshId)?.alpha;
  }
  async function setMeshEdgesOpacity(meshId: MeshId, opacity: Opacity): Promise<unknown> {
    const params = { id: meshId, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshEdgesConstantColor(meshId);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesColoring(meshId, {
            constant: { ...color, alpha: opacity },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshEdgesOpacity,
    setMeshEdgesOpacity,
  };
}
