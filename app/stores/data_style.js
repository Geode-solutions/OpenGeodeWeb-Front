import { getDefaultStyle } from "../utils/default_styles"
import { useDataStore } from "@ogw_front/stores/data"
import useDataStyleState from "../../internal/stores/data_style_state"
import useMeshStyle from "../../internal/stores/mesh/index"
import useModelStyle from "../../internal/stores/model/index"

export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState()
  const meshStyleStore = useMeshStyle()
  const modelStyleStore = useModelStyle()
  const dataStore = useDataStore()

  function addDataStyle(id, geode_object) {
    dataStyleState.styles[id] = getDefaultStyle(geode_object)
  }

  function setVisibility(id, visibility, itemData = null) {
    let viewer_type
    if (itemData) {
      viewer_type = itemData.viewer_type
    } else {
      const item = dataStore.getItem(id)
      if (!item.value) {
        throw new Error("Item not found or not loaded: " + id)
      }
      viewer_type = item.value.viewer_type
    }

    if (viewer_type === "mesh") {
      return Promise.all([meshStyleStore.setMeshVisibility(id, visibility)])
    } else if (viewer_type === "model") {
      return Promise.all([modelStyleStore.setModelVisibility(id, visibility)])
    }
    throw new Error("Unknown viewer_type")
  }

  function applyDefaultStyle(id, itemData = null) {
    let viewer_type
    if (itemData) {
      viewer_type = itemData.viewer_type
    } else {
      const item = dataStore.getItem(id)
      if (!item.value) {
        throw new Error("Item not found or not loaded: " + id)
      }
      viewer_type = item.value.viewer_type
    }

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
