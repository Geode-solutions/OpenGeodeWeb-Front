import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesVisibilityStyle } from "./visibility";
import { useModelEdgesWidthStyle } from "./width";

export function useModelEdgesStyle(): ReturnType<typeof useModelEdgesCommonStyle> &
  ReturnType<typeof useModelEdgesVisibilityStyle> &
  ReturnType<typeof useModelEdgesWidthStyle> {
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesVisibilityStyle = useModelEdgesVisibilityStyle();
  const modelEdgesWidthStyle = useModelEdgesWidthStyle();

  return {
    ...modelEdgesCommonStyle,
    ...modelEdgesVisibilityStyle,
    ...modelEdgesWidthStyle,
  };
}
