// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.apply_textures;

export function useMeshPolygonsTexturesStyle(): {
  meshPolygonsTextures: (id: string) => unknown;
  setMeshPolygonsTextures: (id: string, textures: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsTextures(id: string): unknown {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).textures;
  }
  async function setMeshPolygonsTextures(id: string, textures: unknown): Promise<unknown> {
    const params = { id, textures };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
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
