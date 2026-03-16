// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex

export function useMeshCellsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsVertexAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).vertex
  }

  function meshCellsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  async function setMeshCellsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.cells.coloring.vertex.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshCellsVertexAttributeStoredConfig(id, name)
  }

  function meshCellsVertexAttributeName(id) {
    console.log(
      meshCellsVertexAttributeName.name,
      { id },
      meshCellsVertexAttribute(id),
    )
    return meshCellsVertexAttribute(id).name
  }
  function setMeshCellsVertexAttributeName(id, name) {
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const vertex = style.cells.coloring.vertex
        vertex.name = name
        if (!(name in vertex.storedConfigs)) {
          vertex.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshCellsVertexAttributeStoredConfig(
        id,
        name,
      )
      await setMeshCellsVertexAttributeRange(id, minimum, maximum)
      console.log(
        setMeshCellsVertexAttributeName.name,
        { id },
        meshCellsVertexAttributeName(id),
      )
    }

    if (meshCellsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshCellsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.cells.coloring.vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshCellsVertexAttributeColorMap(
      id,
      meshCellsVertexAttributeColorMap(id),
    )
  }

  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.cells.coloring.vertex.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshCellsVertexAttributeColorMap.name,
        { id },
        meshCellsVertexAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
    }

    if (meshCellsVertexAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig

      console.log(setMeshCellsVertexAttributeColorMap.name, {
        id,
        minimum,
        maximum,
        colorMap,
      })
      return viewerStore.request(
        meshCellsVertexAttributeSchemas.color_map,
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
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  }
}
