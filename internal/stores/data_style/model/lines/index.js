// Local imports
import { useModelLinesColorStyle } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesVisibilityStyle } from "./visibility";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVisibilityStyle = useModelLinesVisibilityStyle();
  const modelLinesColorStyle = useModelLinesColorStyle();

  return {
    setModelLinesDefaultStyle,
    ...modelLinesCommonStyle,
    ...modelLinesVisibilityStyle,
    ...modelLinesColorStyle,
  };
}
