// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsTexturesSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.apply_textures

export function useMeshPolygonsTexturesStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsTextures(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).textures
  }
  function setMeshPolygonsTextures(id, textures) {
    return viewerStore.request(
      meshPolygonsTexturesSchemas,
      { id, textures },
      {
        response_function: async () => {
          const dataStyleStateStore = useDataStyleStateStore()
          await dataStyleStateStore.mutateStyle(id, (style) => {
            style.polygons.coloring.textures = textures
          })
          console.log(
            setMeshPolygonsTextures.name,
            { id },
            meshPolygonsTextures(id),
          )
        },
      },
    )
  }

  return {
    meshPolygonsTextures,
    setMeshPolygonsTextures,
  }
}
