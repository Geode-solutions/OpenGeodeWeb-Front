import { useDataStyleStateStore } from "../../state"

export function useModelPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  return {
    modelPointsStyle,
  }
}
