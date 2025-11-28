// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function modelSurfacesStyle(id) {
    return dataStyleStore.getStyle(id).surfaces
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
  function setModelSurfacesVisibility(id, surface_ids, visibility) {
    const surface_flat_indexes = dataBaseStore.getFlatIndexes(id, surface_ids)
    const viewerStore = useViewerStore()
    return viewer_call(
      viewerStore,
      {
        schema: model_surfaces_schemas.visibility,
        params: { id, block_ids: surface_flat_indexes, visibility },
      },
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

  function setModelSurfacesColor(id, surface_ids, color) {
    const surface_flat_indexes = dataBaseStore.getFlatIndexes(id, surface_ids)
    const viewerStore = useViewerStore()
    return viewer_call(
      viewerStore,
      {
        schema: model_surfaces_schemas.color,
        params: { id, block_ids: surface_flat_indexes, color },
      },
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

  function applyModelSurfacesStyle(id) {
    const style = modelSurfacesStyle(id)
    const surface_ids = dataBaseStore.getSurfacesUuids(id)
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
