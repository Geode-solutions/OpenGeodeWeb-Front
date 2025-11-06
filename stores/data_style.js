import useDataStyleState from "../internal_stores/data_style_state.js"
import useMeshStyle from "../internal_stores/mesh/index.js"
import useModelStyle from "../internal_stores/model/index.js"
import { defineStore } from "pinia"
import { useDataBaseStore } from "./data_base.js"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataBaseStore = useDataBaseStore()

  function addDataStyle(id, geode_object) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
  }

  function setVisibility(id, visibility) {
    const meta = dataBaseStore.itemMetaDatas(id)
    if (!meta) {
      console.warn("[DataStyle] setVisibility skipped: unknown id", id)
      return Promise.resolve([])
    }
    const object_type = meta.object_type
    if (object_type === "mesh") {
      return Promise.all([meshStyleStore.setMeshVisibility(id, visibility)])
    } else if (object_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visibility)])
    }
    throw new Error("Unknown object_type")
  }

  function applyDefaultStyle(id) {
    const { object_type } = dataBaseStore.itemMetaDatas(id)
    if (object_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id)
    } else if (object_type === "model") {
      return modelStyleStore.applyModelStyle(id)
    }
    return Promise.resolve([])
  }

  function setModelEdgesVisibility(id, visibility) {
    modelStyleStore.setModelMeshComponentVisibility(
      id,
      "Edge",
      null,
      visibility,
    )
  }

  function modelEdgesVisibility(id) {
    return modelStyleStore.modelMeshComponentVisibility(id, "Edge", null)
  }

  function exportStores() {
    return { styles: dataStyleState.styles }
  }

  async function importStores(snapshot) {
    const stylesSnapshot = snapshot?.styles || {}
    for (const id of Object.keys(dataStyleState.styles))
      delete dataStyleState.styles[id]
    for (const [id, style] of Object.entries(stylesSnapshot)) {
      dataStyleState.styles[id] = style
    }
  }

  async function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles || {})
    for (const id of ids) {
      const meta = dataBaseStore.itemMetaDatas(id)
      const objectType = meta?.object_type
      const style = dataStyleState.styles[id]
      if (!style || !objectType) continue
      if (objectType === "mesh") {
        await meshStyleStore.applyMeshStyle(id)
      } else if (objectType === "model") {
        await modelStyleStore.applyModelStyle(id)
      }
    }
  }

  return {
    ...dataStyleState,
    ...meshStyleStore,
    ...modelStyleStore,
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    setModelEdgesVisibility,
    modelEdgesVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
  }
})
