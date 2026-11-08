// Third party imports
import viewer_schemas, {
  type MeshApplyTexturesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { MeshId } from "@ogw_front/types/identifiers";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.apply_textures;

export function useMeshCellsTexturesStyle(): {
  meshCellsTextures: (meshId: MeshId) => MeshApplyTexturesParams["textures"] | undefined;
  setMeshCellsTextures: (
    meshId: MeshId,
    textures: MeshApplyTexturesParams["textures"],
  ) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsTextures(meshId: MeshId): MeshApplyTexturesParams["textures"] | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- textures shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(meshId).textures as
      | MeshApplyTexturesParams["textures"]
      | undefined;
  }
  async function setMeshCellsTextures(
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
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsStyle(meshId, {
            coloring: { textures },
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    meshCellsTextures,
    setMeshCellsTextures,
  };
}
