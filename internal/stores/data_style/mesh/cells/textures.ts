// Third party imports
import viewer_schemas, {
  type MeshApplyTexturesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.apply_textures;

export function useMeshCellsTexturesStyle(): {
  meshCellsTextures: (id: string) => MeshApplyTexturesParams["textures"] | undefined;
  setMeshCellsTextures: (
    id: string,
    textures: MeshApplyTexturesParams["textures"],
  ) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsTextures(id: string): MeshApplyTexturesParams["textures"] | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- textures shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(id).textures as
      | MeshApplyTexturesParams["textures"]
      | undefined;
  }
  async function setMeshCellsTextures(
    id: string,
    textures: MeshApplyTexturesParams["textures"],
  ): Promise<unknown> {
    const params = { id, textures };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshCellsCommonStyle.mutateMeshCellsStyle(id, {
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
