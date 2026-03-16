// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolyhedraCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex

export function useMeshPolyhedraVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).vertex
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  async function setMeshPolyhedraVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.polyhedra.coloring.vertex.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshPolyhedraVertexAttributeStoredConfig(id, name)
  }

  function meshPolyhedraVertexAttributeName(id) {
    console.log(
      meshPolyhedraVertexAttributeName.name,
      { id },
      meshPolyhedraVertexAttribute(id),
    )
    return meshPolyhedraVertexAttribute(id).name
  }
  function setMeshPolyhedraVertexAttributeName(id, name) {
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const vertex = style.polyhedra.coloring.vertex
        vertex.name = name
        if (!(name in vertex.storedConfigs)) {
          vertex.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshPolyhedraVertexAttributeStoredConfig(
        id,
        name,
      )
      await setMeshPolyhedraVertexAttributeRange(id, minimum, maximum)
      console.log(
        setMeshPolyhedraVertexAttributeName.name,
        { id },
        meshPolyhedraVertexAttributeName(id),
      )
    }

    if (meshPolyhedraVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolyhedraVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraVertexAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.polyhedra.coloring.vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshPolyhedraVertexAttributeColorMap(
      id,
      meshPolyhedraVertexAttributeColorMap(id),
    )
  }

  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.polyhedra.coloring.vertex.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshPolyhedraVertexAttributeColorMap.name,
        { id },
        meshPolyhedraVertexAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
    }

    if (meshPolyhedraVertexAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig

      console.log(setMeshPolyhedraVertexAttributeColorMap.name, {
        id,
        minimum,
        maximum,
        colorMap,
      })
      return viewerStore.request(
        meshPolyhedraVertexAttributeSchemas.color_map,
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
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
  }
}
