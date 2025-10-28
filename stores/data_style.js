import useDataStyleState from "../internal_stores/data_style_state.js"
import useMeshStyle from "../internal_stores/mesh/index.js"
import useModelStyle from "../internal_stores/model/index.js"

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

  function setVisibility(id, visibility) {
    const object_type = dataBaseStore.itemMetaDatas(id).object_type
    if (object_type === "mesh") {
      return Promise.all([meshStyleStore.setMeshVisibility(id, visibility)])
    } else if (object_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visibility)])
    }
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

  return {
    ...dataStyleState,
    addDataStyle,
    setVisibility,
    setModelEdgesVisibility,
    modelEdgesVisibility,
    ...meshStyleStore,
    ...modelStyleStore,
  }
})

export default useDataStyleStore
