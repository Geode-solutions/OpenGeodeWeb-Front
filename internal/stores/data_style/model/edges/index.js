import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesVisibilityStyle } from "./visibility";

export function useModelEdgesStyle() {
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesVisibilityStyle = useModelEdgesVisibilityStyle();

  function applyModelEdgesStyle(id) {
    const { visibility } = modelEdgesCommonStyle.modelEdgesStyle(id);
    return modelEdgesVisibilityStyle.setModelEdgesVisibility(id, visibility);
  }

  return {
    applyModelEdgesStyle,
    ...modelEdgesCommonStyle,
    ...modelEdgesVisibilityStyle,
  };
}
