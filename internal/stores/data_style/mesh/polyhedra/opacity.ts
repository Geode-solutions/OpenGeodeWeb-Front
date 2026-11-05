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
  meshPolyhedraOpacity: (id: string) => number | undefined;
  setMeshPolyhedraOpacity: (id: string, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraConstantColor(id: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).constant as RGBAColor | undefined;
  }
  function meshPolyhedraOpacity(id: string): number | undefined {
    return meshPolyhedraConstantColor(id)?.alpha;
  }
  async function setMeshPolyhedraOpacity(id: string, opacity: number): Promise<unknown> {
    const params = { id, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshPolyhedraConstantColor(id);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshPolyhedraCommonStyle.mutateMeshPolyhedraColoring(id, {
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
