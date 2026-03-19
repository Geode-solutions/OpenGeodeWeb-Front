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

  function mutateMeshCellsVertexStyle(id, values) {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        vertex: values,
      },
    })
  }

  function setMeshCellsVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshCellsVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    })
  }

  function meshCellsVertexAttributeName(id) {
    return meshCellsVertexAttribute(id).name
  }

  function setMeshCellsVertexAttributeName(id, name) {
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name }
          const vertex = meshCellsVertexAttribute(id)
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            }
          }
          return mutateMeshCellsVertexStyle(id, updates)
        },
      },
    )
  }

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    return setMeshCellsVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
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
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshCellsVertexAttributeStoredConfig(id, name, { colorMap })
        },
      },
    )
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
