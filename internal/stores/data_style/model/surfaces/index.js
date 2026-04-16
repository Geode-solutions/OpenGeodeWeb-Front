import { useModelComponentColor } from "@ogw_internal/stores/data_style/model/color";
import { useModelComponentVisibility } from "@ogw_internal/stores/data_style/model/visibility";
import { useModelSurfacesCommonStyle } from "./common";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}

export function useModelSurfacesStyle() {
  return {
    setModelSurfacesDefaultStyle,
    ...useModelSurfacesCommonStyle(),
    ...useModelComponentVisibility("Surface"),
    ...useModelComponentColor("Surface"),
  };
}
