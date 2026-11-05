import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.opacity;

// The opacity is the constant color alpha, the viewer applies it whatever the coloring
export function useMeshCellsOpacityStyle(): {
  meshCellsOpacity: (id: string) => number | undefined;
  setMeshCellsOpacity: (id: string, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsConstantColor(id: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(id).constant as RGBAColor | undefined;
  }
  function meshCellsOpacity(id: string): number | undefined {
    return meshCellsConstantColor(id)?.alpha;
  }
  async function setMeshCellsOpacity(id: string, opacity: number): Promise<unknown> {
    const params = { id, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshCellsConstantColor(id);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsColoring(id, {
            constant: { ...color, alpha: opacity },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshCellsOpacity,
    setMeshCellsOpacity,
  };
}
