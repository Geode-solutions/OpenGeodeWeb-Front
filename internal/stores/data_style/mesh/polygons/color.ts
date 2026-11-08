import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useMeshPolygonsOpacityStyle } from "./opacity";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.color;

export function useMeshPolygonsColorStyle(): ReturnType<typeof useMeshPolygonsOpacityStyle> & {
  meshPolygonsColor: (meshId: MeshId) => RGBAColor | undefined;
  setMeshPolygonsColor: (meshId: MeshId, color: RGBAColor) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).constant as RGBAColor | undefined;
  }
  async function setMeshPolygonsColor(meshId: MeshId, color: RGBAColor): Promise<unknown> {
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsColoring(meshId, {
            constant: color,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPolygonsColor,
    setMeshPolygonsColor,
    ...useMeshPolygonsOpacityStyle(),
  };
}
