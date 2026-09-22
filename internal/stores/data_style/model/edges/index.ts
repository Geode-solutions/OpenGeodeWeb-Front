import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesVisibilityStyle } from "./visibility";

export function useModelEdgesStyle(): ReturnType<typeof useModelEdgesCommonStyle> &
  ReturnType<typeof useModelEdgesVisibilityStyle> {
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesVisibilityStyle = useModelEdgesVisibilityStyle();

  return {
    ...modelEdgesCommonStyle,
    ...modelEdgesVisibilityStyle,
  };
}
