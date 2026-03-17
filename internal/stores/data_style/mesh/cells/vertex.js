// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"
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

  function setMeshCellsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    return meshCellsCommonStyle
      .mutateMeshCellsVertexStyle(id, (vertex) => {
        vertex.storedConfigs[name] = {
          minimum,
          maximum,
          colorMap,
        }
      })
      .then(() => {
        return meshCellsVertexAttributeStoredConfig(id, name)
      })
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
    const mutate = () => {
      return meshCellsCommonStyle
        .mutateMeshCellsVertexStyle(id, (vertex) => {
          vertex.name = name
          if (!(name in vertex.storedConfigs)) {
            vertex.storedConfigs[name] = {
              minimum: undefined,
              maximum: undefined,
              colorMap: undefined,
            }
          }
        })
        .then(() => {
          const { minimum, maximum } = meshCellsVertexAttributeStoredConfig(
            id,
            name,
          )
          return setMeshCellsVertexAttributeRange(id, minimum, maximum).then(
            () => {
              console.log(
                setMeshCellsVertexAttributeName.name,
                { id },
                meshCellsVertexAttributeName(id),
              )
            },
          )
        })
    }

    if (meshCellsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshCellsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    return meshCellsCommonStyle
      .mutateMeshCellsVertexStyle(id, (vertex) => {
        const storedConfig = vertex.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
      })
      .then(() => {
        return setMeshCellsVertexAttributeColorMap(
          id,
          meshCellsVertexAttributeColorMap(id),
        )
      })
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
    const mutate = () => {
      return meshCellsCommonStyle
        .mutateMeshCellsVertexStyle(id, (vertex) => {
          vertex.storedConfigs[name].colorMap = colorMap
        })
        .then(() => {
          console.log(
            setMeshCellsVertexAttributeColorMap.name,
            { id },
            meshCellsVertexAttributeColorMap(id),
          )
        })
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return mutate()
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
          response_function: mutate,
        },
      )
    } else {
      return mutate()
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
