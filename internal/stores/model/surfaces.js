// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "@/internal/stores/data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelSurfacesStyle(id) {
    return dataStyleStateStore.getStyle(id).surfaces
  }
  function modelSurfaceStyle(id, surface_id) {
    if (!modelSurfacesStyle(id)[surface_id]) {
      modelSurfacesStyle(id)[surface_id] = {}
    }
    return modelSurfacesStyle(id)[surface_id]
  }

  function modelSurfaceVisibility(id, surface_id) {
    return modelSurfaceStyle(id, surface_id).visibility
  }
  function saveModelSurfaceVisibility(id, surface_id, visibility) {
    modelSurfaceStyle(id, surface_id).visibility = visibility
  }
  async function setModelSurfacesVisibility(id, surface_ids, visibility) {
    const surface_flat_indexes = await dataStore.getFlatIndexes(
      id,
      surface_ids,
    )
    if (surface_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_surfaces_schemas.visibility,
      { id, block_ids: surface_flat_indexes, visibility },
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
  function modelSurfaceColor(id, surface_id) {
    return modelSurfaceStyle(id, surface_id).color
  }
  function saveModelSurfaceColor(id, surface_id, color) {
    modelSurfaceStyle(id, surface_id).color = color
  }

  async function setModelSurfacesColor(id, surface_ids, color) {
    const surface_flat_indexes = await dataStore.getFlatIndexes(
      id,
      surface_ids,
    )
    if (surface_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_surfaces_schemas.color,
      { id, block_ids: surface_flat_indexes, color },
      {
        response_function: () => {
          for (const surface_id of surface_ids) {
            saveModelSurfaceColor(id, surface_id, color)
          }
          console.log(
            setModelSurfacesColor.name,
            { id },
            { surface_ids },
            JSON.stringify(modelSurfaceColor(id, surface_ids[0])),
          )
        },
      },
    )
  }

  async function applyModelSurfacesStyle(id) {
    const style = modelSurfacesStyle(id)
    const surface_ids = await dataStore.getSurfacesUuids(id)
    return Promise.all([
      setModelSurfacesVisibility(id, surface_ids, style.visibility),
      setModelSurfacesColor(id, surface_ids, style.color),
    ])
  }

  return {
    modelSurfaceVisibility,
    modelSurfaceColor,
    setModelSurfacesVisibility,
    setModelSurfacesColor,
    applyModelSurfacesStyle,
  }
}
