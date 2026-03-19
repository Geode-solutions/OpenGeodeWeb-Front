import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateModelEdgesStyle(id, values) {
    const merge = (target, source) => {
      for (const [key, value] of Object.entries(source)) {
        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          if (!(key in target)) {
            target[key] = {}
          }
          merge(target[key], value)
        } else {
          target[key] = value
        }
      }
    }
    return dataStyleStateStore.mutateStyle(id, (style) => {
      merge(style.edges, values)
    })
  }

  function modelEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  }
}
