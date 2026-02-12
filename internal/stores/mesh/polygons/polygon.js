// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsSharedStore } from "./shared"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon

export function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsSharedStore = useMeshPolygonsSharedStore()

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsSharedStore.meshPolygonsColoring(id).polygon
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name) {
    const storedConfigs = meshPolygonsPolygonAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
    })
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshPolygonsPolygonAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    return viewerStore.request(
      meshPolygonsPolygonAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPolygonsPolygonAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshPolygonsPolygonAttributeStoredConfig(id, name)
          await setMeshPolygonsPolygonAttributeRange(id, minimum, maximum)
          await setMeshPolygonsPolygonAttributeColorMap(id, colorMap)
          console.log(
            setMeshPolygonsPolygonAttributeName.name,
            { id },
            meshPolygonsPolygonAttributeName(id),
          )
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
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    return viewerStore.request(
      meshPolygonsPolygonAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshPolygonsPolygonAttributeRange.name,
            { id },
            meshPolygonsPolygonAttributeRange(id),
          )
        },
      },
    )
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
          storedConfig.colorMap = colorMap
          console.log(
            setMeshPolygonsPolygonAttributeColorMap.name,
            { id },
            meshPolygonsPolygonAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  }
}
