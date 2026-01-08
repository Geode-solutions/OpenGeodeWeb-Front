import { reactive, computed } from "vue"

export const useDataStyleStateStore = defineStore("dataStyleState", () => {
  const styles = reactive({})

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

  return { getStyle, styles, objectVisibility, selectedObjects }
})
