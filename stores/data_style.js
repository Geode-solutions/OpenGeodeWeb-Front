import useDataStyleState from "../internal_stores/data_style_state.js"
import useMeshStyle from "../internal_stores/mesh/index.js"
import useModelStyle from "../internal_stores/model/index.js"
import { defineStore } from "pinia"
import { useDataBaseStore } from "./data_base.js"

export const useDataStyleStore = defineStore("dataStyle", () => {
  /** States **/
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataBaseStore = useDataBaseStore()

  /** Actions **/
  function addDataStyle(id, geode_object, object_type) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
    const promise_array = []
    if (object_type === "mesh") {
      promise_array.push(meshStyleStore.applyMeshDefaultStyle(id))
    } else if (object_type === "model") {
      promise_array.push(modelStyleStore.setMeshComponentsDefaultStyle(id))
      promise_array.push(modelStyleStore.applyModelDefaultStyle(id))
    } else {
      throw new Error("Unknown object type")
    }
    return Promise.all(promise_array)
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
      return Promise.all([meshStyleStore.setMeshVisibility(id, visible)])
    } else if (object_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visible)])
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
    console.log(
      "[DataStyle] importStores snapshot ids:",
      Object.keys(stylesSnapshot),
    )

    for (const id of Object.keys(dataStyleState.styles)) {
      delete dataStyleState.styles[id]
    }
    for (const [id, style] of Object.entries(stylesSnapshot)) {
      dataStyleState.styles[id] = style
    }
  }

  async function applyAllStylesFromState() {
    const ids = Object.keys(dataStyleState.styles || {})
    console.log("[DataStyle] applyAllStylesFromState ids:", ids)
    const applyTasks = []
    for (const id of ids) {
      const meta = dataBaseStore.itemMetaDatas(id)
      const objectType = meta?.object_type
      const style = dataStyleState.styles[id]
      if (!style) {
        console.warn("[DataStyle] No style for id:", id, "skip")
        continue
      }
      if (objectType === "mesh") {
        applyTasks.push(Promise.all(meshStyleStore.applyMeshDefaultStyle(id)))
      } else if (objectType === "model") {
        applyTasks.push(modelStyleStore.applyModelDefaultStyle(id))
      }
    }
    await Promise.all(applyTasks)
    console.log("[DataStyle] applyAllStylesFromState finished")
  }

  return {
    ...dataStyleState,
    addDataStyle,
    setVisibility,
    setModelEdgesVisibility,
    modelEdgesVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
    ...meshStyleStore,
    ...modelStyleStore,
  }
})

export default useDataStyleStore
