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

  // useDataStyleStore: setVisibility
  function setVisibility(payloadOrId, visibility) {
    const id =
      typeof payloadOrId === "string"
        ? payloadOrId
        : (payloadOrId?.id ?? payloadOrId?.data_id ?? payloadOrId?.model_id)
    if (!id) return Promise.resolve([])

    const visible =
      typeof visibility === "boolean"
        ? visibility
        : payloadOrId?.visible != null
          ? !!payloadOrId.visible
          : true

    const meta = dataBaseStore.itemMetaDatas(id)
    const object_type = meta?.object_type
    if (!object_type) return Promise.resolve([])

    if (object_type === "mesh") {
      return Promise.all([meshStyleStore.setMeshVisibility(id, visibility)])
    } else if (object_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visibility)])
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
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    setModelEdgesVisibility,
    modelEdgesVisibility,
    exportStores,
    importStores,
    ...meshStyleStore,
    ...modelStyleStore,
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
  }
})
