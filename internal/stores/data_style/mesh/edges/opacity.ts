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
  meshEdgesOpacity: (id: string) => number | undefined;
  setMeshEdgesOpacity: (id: string, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesConstantColor(id: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(id).constant as RGBAColor | undefined;
  }
  function meshEdgesOpacity(id: string): number | undefined {
    return meshEdgesConstantColor(id)?.alpha;
  }
  async function setMeshEdgesOpacity(id: string, opacity: number): Promise<unknown> {
    const params = { id, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshEdgesConstantColor(id);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesColoring(id, {
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
