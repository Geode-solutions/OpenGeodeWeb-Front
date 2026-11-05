import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";
import { useMeshEdgesOpacityStyle } from "./opacity";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.color;

export function useMeshEdgesColorStyle(): ReturnType<typeof useMeshEdgesOpacityStyle> & {
  meshEdgesColor: (meshId: DataId) => RGBAColor | undefined;
  setMeshEdgesColor: (meshId: DataId, color: RGBAColor) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColor(meshId: DataId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).constant as RGBAColor | undefined;
  }
  async function setMeshEdgesColor(meshId: DataId, color: RGBAColor): Promise<unknown> {
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshEdgesCommonStyle.mutateMeshEdgesColoring(meshId, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshEdgesColor,
    setMeshEdgesColor,
    ...useMeshEdgesOpacityStyle(),
  };
}
