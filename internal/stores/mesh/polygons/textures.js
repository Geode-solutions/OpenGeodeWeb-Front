// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsSharedStore } from "./shared"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsTexturesSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.apply_textures

export function useMeshPolygonsTexturesStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsSharedStore = useMeshPolygonsSharedStore()

  function meshPolygonsTextures(id) {
    return meshPolygonsSharedStore.meshPolygonsColoring(id).textures
  }
  function setMeshPolygonsTextures(id, textures) {
    return viewerStore.request(
      meshPolygonsTexturesSchemas,
      { id, textures },
      {
        response_function: () => {
          meshPolygonsSharedStore.meshPolygonsColoring(id).textures = textures
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
