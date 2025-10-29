// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function modelSurfaceStyle(id, surface_id) {
    if (!dataStyleStore.getStyle(id).surfaces[surface_id]) {
      dataStyleStore.getStyle(id).surfaces[surface_id] = {}
    }
    return dataStyleStore.getStyle(id).surfaces[surface_id]
  }

  function modelSurfaceVisibility(id, surface_id) {
    return modelSurfaceStyle(id, surface_id).visibility
  }
  function saveModelSurfaceVisibility(id, surface_id, visibility) {
    modelSurfaceStyle(id, surface_id).visibility = visibility
  }
  function setModelSurfacesVisibility(id, surface_ids, visibility) {
    const surface_flat_indexes = dataBaseStore.getFlatIndexes(id, surface_ids)
    return viewer_call(
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
            `${setModelSurfacesVisibility.name} ${id} ${surface_ids} ${modelSurfaceVisibility(id, surface_ids[0])}`,
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
    return viewer_call(
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
            `${setModelSurfacesColor.name} ${id} ${surface_ids} ${modelSurfaceColor(id, surface_ids[0])}`,
          )
        },
      },
    )
  }

  function setModelSurfacesDefaultStyle(id) {
    const surface_ids = dataBaseStore.getSurfacesUuids(id)
    setModelSurfacesVisibility(
      id,
      surface_ids,
      dataStyleStore.styles[id].surfaces.visibility,
    )
  }

  function applyModelSurfacesStyle(id) {
    console.log("applyModelSurfacesStyle", id)
    const surfaces_style = dataStyleStore.getStyle(id).surfaces
    console.log("surfaces_style", surfaces_style)
    const block_ids = dataBaseStore.getSurfacesUuids(id)
    return Promise.all([
      setModelSurfacesVisibility(id, [block_ids], surfaces_style.visibility),
      setModelSurfacesColor(id, [block_ids], surfaces_style.color),
    ])
  }

  return {
    modelSurfaceVisibility,
    modelSurfaceColor,
    setModelSurfacesVisibility,
    setModelSurfacesColor,
    setModelSurfacesDefaultStyle,
    applyModelSurfacesStyle,
  }
}
