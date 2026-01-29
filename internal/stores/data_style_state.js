import { reactive, computed } from "vue"

const DEFAULT_COLOR_MAP = "Cool to Warm"

export const useDataStyleStateStore = defineStore("dataStyleState", () => {
  const styles = reactive({})

  const attributeSettings = reactive({})

  const objectVisibility = computed(() => (id) => {
    if (styles[id]) {
      return styles[id].visibility
    }
    return false
  })
  const selectedObjects = computed(() => {
    const selection = []
    for (const [id, value] of Object.entries(styles)) {
      if (value.visibility === true) {
        selection.push(id)
      }
    }
    return selection
  })

  function getStyle(id) {
    return styles[id]
  }

  function getAttributeSettings(meshId, attributeType, attributeName) {
    const key = `${meshId}:${attributeType}:${attributeName}`
    return attributeSettings[key] || null
  }
  function setAttributeSettings(
    meshId,
    attributeType,
    attributeName,
    settings,
  ) {
    const key = `${meshId}:${attributeType}:${attributeName}`
    attributeSettings[key] = {
      min: settings.min,
      max: settings.max,
      colorMap: settings.colorMap || DEFAULT_COLOR_MAP,
    }
  }

  return {
    getStyle,
    styles,
    objectVisibility,
    selectedObjects,
    attributeSettings,
    getAttributeSettings,
    setAttributeSettings,
  }
})
