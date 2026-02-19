// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolyhedraCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron

export function useMeshPolyhedraPolyhedronAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).polyhedron
  }

  function meshPolyhedraPolyhedronAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshPolyhedraPolyhedronAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshPolyhedraPolyhedronAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshPolyhedraPolyhedronAttributeName(id) {
    return meshPolyhedraPolyhedronAttribute(id).name
  }
  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    return viewerStore.request(
      meshPolyhedraPolyhedronAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPolyhedraPolyhedronAttribute(id).name = name
          const { minimum, maximum } =
            meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
          await setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum)
          console.log(
            setMeshPolyhedraPolyhedronAttributeName.name,
            { id },
            meshPolyhedraPolyhedronAttributeName(id),
          )
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    return setMeshPolyhedraPolyhedronAttributeColorMap(
      id,
      storedConfig.colorMap,
    )
  }

  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      storedConfig.colorMap = colorMap
      return
    }
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig
    return viewerStore.request(
      meshPolyhedraPolyhedronAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshPolyhedraPolyhedronAttributeColorMap.name,
            { id },
            meshPolyhedraPolyhedronAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  }
}
