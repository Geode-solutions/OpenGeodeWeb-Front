import { useDataStyleStateStore } from "../../state"

export function useModelLinesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelLinesStyle(id) {
    return dataStyleStateStore.styles[id].lines
  }

  function modelLineStyle(id, line_id) {
    const groupStyle = modelLinesStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, line_id)
    return { ...groupStyle, ...individualStyle }
  }

  return {
    modelLinesStyle,
    modelLineStyle,
  }
}
