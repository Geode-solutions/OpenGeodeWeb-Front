import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useMeshPolyhedraOpacityStyle } from "./opacity";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.color;

export function useMeshPolyhedraColorStyle(): ReturnType<typeof useMeshPolyhedraOpacityStyle> & {
  meshPolyhedraColor: (meshId: MeshId) => RGBAColor | undefined;
  setMeshPolyhedraColor: (meshId: MeshId, color: RGBAColor) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId).constant as RGBAColor | undefined;
  }
  async function setMeshPolyhedraColor(meshId: MeshId, color: RGBAColor): Promise<unknown> {
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutation_result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraColoring(
            meshId,
            {
              constant: color,
            },
          );
          return mutation_result;
        },
      },
    );
    return result;
  }

  return {
    meshPolyhedraColor,
    setMeshPolyhedraColor,
    ...useMeshPolyhedraOpacityStyle(),
  };
}
