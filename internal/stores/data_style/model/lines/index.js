import { useModelComponentColor } from "@ogw_internal/stores/data_style/model/color";
import { useModelComponentVisibility } from "@ogw_internal/stores/data_style/model/visibility";
import { useModelLinesCommonStyle } from "./common";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  return {
    setModelLinesDefaultStyle,
    ...useModelLinesCommonStyle(),
    ...useModelComponentVisibility("Line"),
    ...useModelComponentColor("Line"),
  };
}
