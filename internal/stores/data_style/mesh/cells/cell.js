// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshCellsCellAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell

export function useMeshCellsCellAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsCellAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).cell
  }

  function meshCellsCellAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  async function setMeshCellsCellAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.cells.coloring.cell.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshCellsCellAttributeStoredConfig(id, name)
  }
  function meshCellsCellAttributeName(id) {
    console.log(
      meshCellsCellAttributeName.name,
      { id },
      meshCellsCellAttribute(id),
    )
    return meshCellsCellAttribute(id).name
  }
  function setMeshCellsCellAttributeName(id, name) {
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const cell = style.cells.coloring.cell
        cell.name = name
        if (!(name in cell.storedConfigs)) {
          cell.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshCellsCellAttributeStoredConfig(id, name)
      await setMeshCellsCellAttributeRange(id, minimum, maximum)
      console.log(
        setMeshCellsCellAttributeName.name,
        { id },
        meshCellsCellAttributeName(id),
      )
    }

    if (meshCellsCellAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshCellsCellAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.cells.coloring.cell.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshCellsCellAttributeColorMap(
      id,
      meshCellsCellAttributeColorMap(id),
    )
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.cells.coloring.cell.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshCellsCellAttributeColorMap.name,
        { id },
        meshCellsCellAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
    }

    if (meshCellsCellAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig

      console.log(setMeshCellsCellAttributeColorMap.name, {
        id,
        minimum,
        maximum,
        colorMap,
      })
      return viewerStore.request(
        meshCellsCellAttributeSchemas.color_map,
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
    meshCellsCellAttributeName,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
  }
}
