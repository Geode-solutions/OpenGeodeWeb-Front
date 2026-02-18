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

  async function updateMeshPolygonsPolygonAttribute(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    await setMeshPolygonsPolygonAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshPolygonsPolygonAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
      isAutoSet: false,
    })
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap, isAutoSet },
  ) {
    const storedConfigs = meshPolygonsPolygonAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap, isAutoSet }
    return storedConfigs[name]
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    meshPolygonsPolygonAttribute(id).name = name
    return viewerStore.request(
      meshPolygonsPolygonAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } = meshPolygonsPolygonAttributeStoredConfig(
            id,
            name,
          )
          await setMeshPolygonsPolygonAttributeRange(id, minimum, maximum)
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
    console.log(
      meshPolygonsPolygonAttributeRange.name,
      { id },
      { minimum, maximum },
    )
    return [minimum, maximum]
  }
  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    storedConfig.isAutoSet = true
    return setMeshPolygonsPolygonAttributeColorMap(id, storedConfig.colorMap)
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
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    updateMeshPolygonsPolygonAttribute,
  }
}
