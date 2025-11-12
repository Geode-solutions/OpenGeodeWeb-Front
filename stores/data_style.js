import { getDefaultStyle } from "../utils/default_styles.js"
import useDataStyleState from "../internal_stores/data_style_state.js"
import useMeshStyle from "../internal_stores/mesh/index.js"
import useModelStyle from "../internal_stores/model/index.js"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataBaseStore = useDataBaseStore()
  const hybridViewerStore = useHybridViewerStore()

  function addDataStyle(id, geode_object) {
    const style = getDefaultStyle(geode_object)
    dataStyleState.styles[id] = style
  }

  function setVisibility(id, visibility) {
    const meta = dataBaseStore.itemMetaDatas(id)
    if (!meta) {
      return Promise.resolve([])
    }
    const { object_type } = meta
    if (object_type === "mesh") {
      return Promise.all([
        meshStyleStore.setMeshVisibility(id, visibility),
      ]).then(() => {
        hybridViewerStore.remoteRender()
      })
    } else if (object_type === "model") {
      return Promise.all([
        modelStyleStore.setModelVisibility(id, visibility),
      ]).then(() => {
        hybridViewerStore.remoteRender()
      })
    }
    throw new Error("Unknown object_type")
  }

  function applyDefaultStyle(id) {
    const { object_type } = dataBaseStore.itemMetaDatas(id)
    if (object_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id).then(() => {
        hybridViewerStore.remoteRender()
      })
    } else if (object_type === "model") {
      return modelStyleStore.applyModelStyle(id).then(() => {
        hybridViewerStore.remoteRender()
      })
    }
    return Promise.resolve([])
  }

  const setModelEdgesVisibility = (id, visibility) => {
    return modelStyleStore.setModelEdgesVisibility(id, visibility)
  }

  const modelEdgesVisibility = (id) => {
    return modelStyleStore.modelEdgesVisibility(id)
  }

  const exportStores = () => {
    return { styles: dataStyleState.styles }
  }

  const importStores = (snapshot) => {
    const stylesSnapshot = snapshot.styles || {}
    for (const id of Object.keys(dataStyleState.styles)) {
      delete dataStyleState.styles[id]
    }
    for (const [id, style] of Object.entries(stylesSnapshot)) {
      dataStyleState.styles[id] = style
    }
  }

  const applyAllStylesFromState = () => {
    const ids = Object.keys(dataStyleState.styles || {})
    const promises = []
    for (const id of ids) {
      const meta = dataBaseStore.itemMetaDatas(id)
      const objectType = meta?.object_type
      const style = dataStyleState.styles[id]
      if (style && objectType === "mesh") {
        promises.push(meshStyleStore.applyMeshStyle(id))
      } else if (style && objectType === "model") {
        promises.push(modelStyleStore.applyModelStyle(id))
      }
    }
    return Promise.all(promises).then(() => {
      hybridViewerStore.remoteRender()
    })
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
