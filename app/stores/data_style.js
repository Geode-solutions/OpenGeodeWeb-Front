import { getDefaultStyle } from "../utils/default_styles.js"
import { useDataBaseStore } from "@ogw_front/stores/data_base"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import useDataStyleState from "../internal/stores/data_style_state.js"
import useMeshStyle from "../internal/stores/mesh/index.js"
import useModelStyle from "../internal/stores/model/index.js"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataBaseStore = useDataBaseStore()
  const hybridViewerStore = useHybridViewerStore()

  function addDataStyle(id, geode_object) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
  }

  function setVisibility(id, visibility) {
    console.log(
      "dataBaseStore.itemMetaDatas(id)",
      dataBaseStore.itemMetaDatas(id),
    )
    const { viewer_type } = dataBaseStore.itemMetaDatas(id)
    if (viewer_type === "mesh") {
      return Promise.all([meshStyleStore.setMeshVisibility(id, visibility)])
    } else if (viewer_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visibility)])
    }
    throw new Error("Unknown viewer_type")
  }

  function applyDefaultStyle(id) {
    const { viewer_type } = dataBaseStore.itemMetaDatas(id)
    if (viewer_type === "mesh") {
      return meshStyleStore.applyMeshStyle(id)
    } else if (viewer_type === "model") {
      return modelStyleStore.applyModelStyle(id)
    } else {
      throw new Error("Unknown viewer_type: " + viewer_type)
    }
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
    ...dataStyleState,
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
