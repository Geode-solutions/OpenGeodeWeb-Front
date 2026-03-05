import { useDataStyleStateStore } from "../../state"

export function useModelBlocksCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelBlocksStyle(id) {
    return dataStyleStateStore.getStyle(id).blocks
  }

  function modelBlockStyle(id, block_id) {
    if (!modelBlocksStyle(id)[block_id]) {
      modelBlocksStyle(id)[block_id] = {}
    }
    return modelBlocksStyle(id)[block_id]
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
  }
}
