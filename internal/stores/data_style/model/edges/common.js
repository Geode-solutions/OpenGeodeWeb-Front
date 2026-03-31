import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleState();

  function mutateModelEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      edges: values,
    });
  }

  function modelEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges;
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  };
}
