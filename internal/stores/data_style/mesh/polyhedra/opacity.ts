import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.opacity;

// The opacity is the constant color alpha, the viewer applies it whatever the coloring
export function useMeshPolyhedraOpacityStyle(): {
  meshPolyhedraOpacity: (meshId: DataId) => number | undefined;
  setMeshPolyhedraOpacity: (meshId: DataId, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraConstantColor(meshId: DataId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId).constant as RGBAColor | undefined;
  }
  function meshPolyhedraOpacity(meshId: DataId): number | undefined {
    return meshPolyhedraConstantColor(meshId)?.alpha;
  }
  async function setMeshPolyhedraOpacity(meshId: DataId, opacity: number): Promise<unknown> {
    const params = { id: meshId, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshPolyhedraConstantColor(meshId);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshPolyhedraCommonStyle.mutateMeshPolyhedraColoring(meshId, {
            constant: { ...color, alpha: opacity },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPolyhedraOpacity,
    setMeshPolyhedraOpacity,
  };
}
