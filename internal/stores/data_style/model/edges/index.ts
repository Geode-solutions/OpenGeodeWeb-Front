import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesVisibilityStyle } from "./visibility";

export function useModelEdgesStyle() {
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesVisibilityStyle = useModelEdgesVisibilityStyle();

  return {
    ...modelEdgesCommonStyle,
    ...modelEdgesVisibilityStyle,
  };
}
