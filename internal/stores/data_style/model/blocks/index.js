import { useModelBlocksCommonStyle } from "./common";
import { useModelComponentColor } from "@ogw_internal/stores/data_style/model/color";
import { useModelComponentVisibility } from "@ogw_internal/stores/data_style/model/visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  return {
    setModelBlocksDefaultStyle,
    ...useModelBlocksCommonStyle(),
    ...useModelComponentVisibility("Block"),
    ...useModelComponentColor("Block"),
  };
}
