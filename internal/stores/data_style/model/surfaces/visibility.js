// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelSurfacesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesVisibilityStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle()
  function modelSurfaceVisibility(id, surface_id) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).visibility
  }
  function saveModelSurfaceVisibility(id, surface_id, visibility) {
    modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).visibility =
      visibility
  }
  async function setModelSurfacesVisibility(id, surface_ids, visibility) {
    if (!surface_ids || surface_ids.length === 0) {
      return
    }
    const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      surface_ids,
    )
    if (!surface_viewer_ids || surface_viewer_ids.length === 0) {
      console.warn(
        "[setModelSurfacesVisibility] No viewer IDs found, skipping visibility request",
        { id, surface_ids },
      )
      return
    }
    return viewerStore.request(
      model_surfaces_schemas.visibility,
      { id, block_ids: surface_viewer_ids, visibility },
      {
        response_function: () => {
          for (const surface_id of surface_ids) {
            saveModelSurfaceVisibility(id, surface_id, visibility)
          }
          console.log(
            setModelSurfacesVisibility.name,
            { id },
            { surface_ids },
            modelSurfaceVisibility(id, surface_ids[0]),
          )
        },
      },
    )
  }

  return {
    modelSurfaceVisibility,
    setModelSurfacesVisibility,
  }
}
