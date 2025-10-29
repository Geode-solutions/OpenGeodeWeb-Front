// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function modelSurfaceVisibility(id, surface_id) {
    return dataStyleStore.styles[id].surfaces[surface_id].visibility
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
            if (!dataStyleStore.styles[id].surfaces[surface_id])
              dataStyleStore.styles[id].surfaces[surface_id] = {}
            dataStyleStore.styles[id].surfaces[surface_id].visibility =
              visibility
          }
          console.log("setModelSurfacesVisibility", surface_ids, visibility)
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

  function applySurfacesStyle(id) {
    const surfaces = dataStyleStore.styles[id].surfaces
    for (const [surface_id, style] of Object.entries(surfaces)) {
      setModelSurfacesVisibility(id, [surface_id], style.visibility)
    }
  }

  return {
    modelSurfaceVisibility,
    setModelSurfacesDefaultStyle,
    setModelSurfacesVisibility,
    applySurfacesStyle,
  }
}
