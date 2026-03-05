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

  async function setMeshPolyhedraPolyhedronAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.polyhedra.coloring.polyhedron.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
  }

  function meshPolyhedraPolyhedronAttributeName(id) {
    return meshPolyhedraPolyhedronAttribute(id).name
  }
  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const polyhedron = style.polyhedra.coloring.polyhedron
        polyhedron.name = name
        if (!(name in polyhedron.storedConfigs)) {
          polyhedron.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } =
        meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
      await setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum)
      console.log(
        setMeshPolyhedraPolyhedronAttributeName.name,
        { id },
        meshPolyhedraPolyhedronAttributeName(id),
      )
    }

    if (meshPolyhedraPolyhedronAttributeSchemas?.name) {
      return viewerStore.request(
        meshPolyhedraPolyhedronAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }
  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraPolyhedronAttributeName(id)
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.polyhedra.coloring.polyhedron.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshPolyhedraPolyhedronAttributeColorMap(
      id,
      meshPolyhedraPolyhedronAttributeColorMap(id),
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
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.polyhedra.coloring.polyhedron.storedConfigs[name].colorMap =
          colorMap
      })
      console.log(
        setMeshPolyhedraPolyhedronAttributeColorMap.name,
        { id },
        meshPolyhedraPolyhedronAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
    }

    if (meshPolyhedraPolyhedronAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig
      return viewerStore.request(
        meshPolyhedraPolyhedronAttributeSchemas.color_map,
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
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  }
}
