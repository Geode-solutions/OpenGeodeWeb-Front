import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsOpacityStyle } from "./opacity";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.color;

export function useMeshPointsColorStyle(): ReturnType<typeof useMeshPointsOpacityStyle> & {
  meshPointsColor: (meshId: DataId) => RGBAColor | undefined;
  setMeshPointsColor: (meshId: DataId, color: RGBAColor) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsColor(meshId: DataId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(meshId).constant as RGBAColor | undefined;
  }
  async function setMeshPointsColor(meshId: DataId, color: RGBAColor): Promise<unknown> {
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPointsCommonStyle.mutateMeshPointsColoring(meshId, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPointsColor,
    setMeshPointsColor,
    ...useMeshPointsOpacityStyle(),
  };
}
