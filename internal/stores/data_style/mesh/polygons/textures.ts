// Third party imports
import viewer_schemas, {
  type MeshApplyTexturesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.apply_textures;

export function useMeshPolygonsTexturesStyle(): {
  meshPolygonsTextures: (meshId: MeshId) => MeshApplyTexturesParams["textures"] | undefined;
  setMeshPolygonsTextures: (
    meshId: MeshId,
    textures: MeshApplyTexturesParams["textures"],
  ) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsTextures(meshId: MeshId): MeshApplyTexturesParams["textures"] | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- textures shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).textures as
      | MeshApplyTexturesParams["textures"]
      | undefined;
  }
  async function setMeshPolygonsTextures(
    meshId: MeshId,
    textures: MeshApplyTexturesParams["textures"],
  ): Promise<unknown> {
    const params = { id: meshId, textures };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(meshId, {
            coloring: { textures },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshPolygonsTextures,
    setMeshPolygonsTextures,
  };
}
