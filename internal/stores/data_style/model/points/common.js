import { useDataStyleStateStore } from "../../state"

export function useModelPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelPointsStyle(id) {
    return dataStyleStateStore.styles[id].points
  }

  return {
    modelPointsStyle,
  }
}
