// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.color;

export function useMeshPolygonsColorStyle(): {
  meshPolygonsColor: (id: string) => unknown;
  setMeshPolygonsColor: (id: string, color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsColor(id: string): unknown {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).constant;
  }
  async function setMeshPolygonsColor(id: string, color: unknown): Promise<unknown> {
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await meshPolygonsCommonStyle.mutateMeshPolygonsColoring(id, {
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
  };
}
