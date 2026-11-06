import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.opacity;

// The opacity is the constant color alpha, the viewer applies it whatever the coloring
export function useMeshPolygonsOpacityStyle(): {
  meshPolygonsOpacity: (meshId: MeshId) => number | undefined;
  setMeshPolygonsOpacity: (meshId: MeshId, opacity: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsConstantColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).constant as RGBAColor | undefined;
  }
  function meshPolygonsOpacity(meshId: MeshId): number | undefined {
    return meshPolygonsConstantColor(meshId)?.alpha;
  }
  async function setMeshPolygonsOpacity(meshId: MeshId, opacity: number): Promise<unknown> {
    const params = { id: meshId, opacity };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const color = meshPolygonsConstantColor(meshId);
          if (color === undefined) {
            return undefined;
          }
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsColoring(meshId, {
            constant: { ...color, alpha: opacity },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPolygonsOpacity,
    setMeshPolygonsOpacity,
  };
}
