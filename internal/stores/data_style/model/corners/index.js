// Local imports
import { useModelCornersColorStyle } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibilityStyle } from "./visibility";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const modelCornersVisibilityStyle = useModelCornersVisibilityStyle();
  const modelCornersColorStyle = useModelCornersColorStyle();

  return {
    setModelCornersDefaultStyle,
    ...modelCornersCommonStyle,
    ...modelCornersVisibilityStyle,
    ...modelCornersColorStyle,
  };
}
