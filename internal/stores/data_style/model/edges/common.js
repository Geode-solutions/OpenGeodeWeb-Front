import { useDataStyleStateStore } from "../../state"

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelEdgesStyle(id) {
    return dataStyleStateStore.styles[id].edges
  }

  return {
    modelEdgesStyle,
  }
}
