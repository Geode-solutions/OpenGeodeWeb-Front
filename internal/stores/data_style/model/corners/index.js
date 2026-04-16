import { useModelComponentColor } from "@ogw_internal/stores/data_style/model/color";
import { useModelComponentVisibility } from "@ogw_internal/stores/data_style/model/visibility";
import { useModelCornersCommonStyle } from "./common";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  return {
    setModelCornersDefaultStyle,
    ...useModelCornersCommonStyle(),
    ...useModelComponentVisibility("Corner"),
    ...useModelComponentColor("Corner"),
  };
}
