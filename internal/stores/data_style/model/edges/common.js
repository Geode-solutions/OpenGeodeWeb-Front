import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore();

  function modelEdgesStyle(id) {
    return dataStyleStateStore.styles[id].edges;
  }

  return {
    modelEdgesStyle,
  };
}
