import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useMeshCellsOpacityStyle } from "./opacity";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.cells.color;

export function useMeshCellsColorStyle(): ReturnType<typeof useMeshCellsOpacityStyle> & {
  meshCellsColor: (meshId: MeshId) => RGBAColor | undefined;
  setMeshCellsColor: (meshId: MeshId, color: RGBAColor) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(meshId).constant as RGBAColor | undefined;
  }
  async function setMeshCellsColor(meshId: MeshId, color: RGBAColor): Promise<unknown> {
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsColoring(meshId, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshCellsColor,
    setMeshCellsColor,
    ...useMeshCellsOpacityStyle(),
  };
}
