import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelPointsStyle(id) {
    return dataStyleStateStore.styles[id].points
  }

  return {
    modelPointsStyle,
  }
}
