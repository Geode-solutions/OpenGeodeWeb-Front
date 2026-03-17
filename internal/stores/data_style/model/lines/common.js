import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelLinesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelLinesStyle(id) {
    return dataStyleStateStore.getStyle(id).lines
  }

  function modelLineStyle(id, line_id) {
    const groupStyle = modelLinesStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, line_id)
    return { ...groupStyle, ...individualStyle }
  }

  function mutateModelLinesStyle(id, line_ids, mutationCallback) {
    return dataStyleStateStore.mutateComponentStyles(
      id,
      line_ids,
      mutationCallback,
    )
  }

  return {
    modelLinesStyle,
    modelLineStyle,
    mutateModelLinesStyle,
  }
}

