import merge from "lodash/merge"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelLinesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelLinesStyle(id) {
    return dataStyleStateStore.getStyle(id).lines
  }

  function modelLineStyle(id, line_id) {
    const groupStyle = modelLinesStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, line_id)
    return merge({}, groupStyle, individualStyle)
  }

  function mutateModelLinesStyle(id, line_ids, values) {
    return dataStyleStateStore.mutateComponentStyles(id, line_ids, values)
  }

  function mutateModelLineStyle(id, line_id, values) {
    return dataStyleStateStore.mutateComponentStyle(id, line_id, values)
  }

  return {
    modelLinesStyle,
    modelLineStyle,
    mutateModelLinesStyle,
    mutateModelLineStyle,
  }
}
