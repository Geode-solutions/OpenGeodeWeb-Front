// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useModelPointsSizeStyle } from "./size";
import { useModelPointsVisibilityStyle } from "./visibility";

export function useModelPointsStyle() {
  const modelPointsCommonStyle = useModelPointsCommonStyle();
  const modelPointsVisibilityStyle = useModelPointsVisibilityStyle();
  const modelPointsSizeStyle = useModelPointsSizeStyle();

  function applyModelPointsStyle(id) {
    const style = modelPointsCommonStyle.modelPointsStyle(id);
    return Promise.all([
      modelPointsVisibilityStyle.setModelPointsVisibility(id, style.visibility),
      modelPointsSizeStyle.setModelPointsSize(id, style.size),
    ]);
  }

  return {
    applyModelPointsStyle,
    ...modelPointsCommonStyle,
    ...modelPointsVisibilityStyle,
    ...modelPointsSizeStyle,
  };
}
