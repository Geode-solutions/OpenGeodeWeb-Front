import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelBlocksCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelBlocksStyle(id) {
    return dataStyleStateStore.styles[id].blocks
  }

  function modelBlockStyle(id, block_id) {
    const groupStyle = modelBlocksStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, block_id)
    return { ...groupStyle, ...individualStyle }
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
  }
}
