// Local imports
import { useModelBlocksColorStyle } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksVisibilityStyle } from "./visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const modelBlocksVisibilityStyle = useModelBlocksVisibilityStyle();
  const modelBlocksColorStyle = useModelBlocksColorStyle();

  return {
    setModelBlocksDefaultStyle,
    ...modelBlocksCommonStyle,
    ...modelBlocksVisibilityStyle,
    ...modelBlocksColorStyle,
  };
}
