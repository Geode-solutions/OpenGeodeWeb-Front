// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

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

  async function setMeshPolygonsPolygonAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.polygons.coloring.polygon.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshPolygonsPolygonAttributeStoredConfig(id, name)
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const polygon = style.polygons.coloring.polygon
        polygon.name = name
        if (!(name in polygon.storedConfigs)) {
          polygon.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
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
    }

    if (meshPolygonsPolygonAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolygonsPolygonAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
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
  async function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.polygons.coloring.polygon.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshPolygonsPolygonAttributeColorMap(
      id,
      meshPolygonsPolygonAttributeColorMap(id),
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.polygons.coloring.polygon.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshPolygonsPolygonAttributeColorMap.name,
        { id },
        meshPolygonsPolygonAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
    }

    if (meshPolygonsPolygonAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig
      return viewerStore.request(
        meshPolygonsPolygonAttributeSchemas.color_map,
        { id, points, minimum, maximum },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
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
