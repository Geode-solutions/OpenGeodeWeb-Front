// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon

export function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).polygon
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function mutateMeshPolygonsPolygonStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        polygon: values,
      },
    })
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(id, name, config) {
    return mutateMeshPolygonsPolygonStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    })
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name
  }

  function setMeshPolygonsPolygonAttributeName(id, name) {
    return viewerStore.request(
      meshPolygonsPolygonAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name }
          const polygon = meshPolygonsPolygonAttribute(id)
          if (!(name in polygon.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            }
          }
          return mutateMeshPolygonsPolygonStyle(id, updates)
        },
      },
    )
  }

  function meshPolygonsPolygonAttributeRange(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }

  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id)
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    })
  }

  function meshPolygonsPolygonAttributeColorMap(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }

  function setMeshPolygonsPolygonAttributeColorMap(id, colorMap) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig
    return viewerStore.request(
      meshPolygonsPolygonAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
            colorMap,
          })
        },
      },
    )
  }

  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  }
}
