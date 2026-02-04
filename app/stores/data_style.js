import { getDefaultStyle } from "@ogw_front/utils/default_styles"
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../../internal/stores/data_style_state"
import useMeshStyle from "../../internal/stores/mesh/index"
import useModelStyle from "../../internal/stores/model/index"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleStateStore()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataStore = useDataStore()

  function addDataStyle(id, geode_object) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
  }

  async function setVisibility(id, visibility) {
    const item = await dataStore.getItem(id).fetch()
    const viewer_type = item?.viewer_type
    if (!viewer_type) {
      throw new Error(`Item not found or not loaded: ${id}`)
    }

    if (viewer_type === "mesh") {
      return meshStyleStore.setMeshVisibility(id, visibility)
    }
    if (viewer_type === "model") {
      return modelStyleStore.setModelVisibility(id, visibility)
    }
    throw new Error("Unknown viewer_type")
  }

  async function applyDefaultStyle(id) {
    const item = await dataStore.getItem(id).fetch()
    const viewer_type = item?.viewer_type
    if (!viewer_type) {
      throw new Error(`Item not found or not loaded: ${id}`)
    }

    if (viewer_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id)
    }
    if (viewer_type === "model") {
      return modelStyleStore.applyModelStyle(id)
    }
    throw new Error(`Unknown viewer_type: ${viewer_type}`)
  }

  function exportStores() {
    return { styles: dataStyleState.styles }
  }

  function importStores(snapshot) {
    const stylesSnapshot = snapshot.styles || {}
    for (const id of Object.keys(dataStyleState.styles)) {
      delete dataStyleState.styles[id]
    }
    for (const [id, style] of Object.entries(stylesSnapshot)) {
      dataStyleState.styles[id] = style
    }
  }

  function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles || {})
    const promises = []
    for (const id of ids) {
      const meta = dataStore.getItem(id).value
      const viewerType = meta?.viewer_type
      const style = dataStyleState.styles[id]
      if (style && viewerType === "mesh") {
        promises.push(meshStyleStore.applyMeshStyle(id))
      } else if (style && viewerType === "model") {
        promises.push(modelStyleStore.applyModelStyle(id))
      }
    }
    return Promise.all(promises)
  }

  return {
    styles: dataStyleState.styles,
    getStyle: dataStyleState.getStyle,
    objectVisibility: dataStyleState.objectVisibility,
    selectedObjects: dataStyleState.selectedObjects,
    ...meshStyleStore,
    ...modelStyleStore,
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
  }
})
