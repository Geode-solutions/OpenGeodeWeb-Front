import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateModelEdgesStyle(id, values) {
    return dataStyleState.mutateStyle(id, {
      edges: values,
    });
  }

  function modelEdgesStyle(id) {
    return dataStyleState.getStyle(id).edges;
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  };
}
