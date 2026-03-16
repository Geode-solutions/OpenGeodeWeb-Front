import { getDefaultStyle } from "@ogw_front/utils/default_styles"
import { database } from "@ogw_internal//database/database.js"
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "@ogw_internal//stores/data_style/state"
import { useMeshStyle } from "@ogw_internal//stores/data_style/mesh/index"
import { useModelStyle } from "@ogw_internal//stores/data_style/model/index"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleStateStore()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataStore = useDataStore()

  async function addDataStyle(id, geode_object) {
    await dataStyleState.updateStyle(id, getDefaultStyle(geode_object))
  }

  async function setVisibility(id, visibility) {
    const item = await dataStore.item(id)
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
    const item = await dataStore.item(id)
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
    return {
      styles: dataStyleState.styles,
      componentStyles: dataStyleState.componentStyles,
    }
  }

  async function importStores(snapshot) {
    const stylesSnapshot = snapshot.styles || {}
    const componentStylesSnapshot = snapshot.componentStyles || {}

    await dataStyleState.clear()

    for (const [id, style] of Object.entries(stylesSnapshot)) {
      await dataStyleState.updateStyle(id, style)
    }

    for (const style of Object.values(componentStylesSnapshot)) {
      await dataStyleState.updateComponentStyle(
        style.id_model,
        style.id_component,
        style,
      )
    }
  }

  async function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles || {})
    const promises = ids.map(async (id) => {
      const meta = await dataStore.item(id)
      if (!meta) return
      const viewerType = meta.viewer_type
      if (viewerType === "mesh") {
        return meshStyleStore.applyMeshStyle(id)
      } else if (viewerType === "model") {
        return modelStyleStore.applyModelStyle(id)
      }
    })
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
