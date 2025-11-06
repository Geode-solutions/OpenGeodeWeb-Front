import useDataStyleState from "../internal_stores/data_style_state.js"
import useMeshStyle from "../internal_stores/mesh/index.js"
import useModelStyle from "../internal_stores/model/index.js"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataBaseStore = useDataBaseStore()

  function addDataStyle(id, geode_object) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
  }

  function setVisibility(id, visibility) {
    console.log(
      "dataBaseStore.itemMetaDatas(id)",
      dataBaseStore.itemMetaDatas(id),
    )
    const object_type = dataBaseStore.itemMetaDatas(id).object_type
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
    } else {
      throw new Error("Unknown object_type: " + object_type)
    }
  }

  return {
    ...dataStyleState,
    ...meshStyleStore,
    ...modelStyleStore,
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
  }
})
