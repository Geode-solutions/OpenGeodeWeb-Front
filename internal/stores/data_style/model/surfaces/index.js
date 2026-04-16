// Local imports
import { useModelSurfacesColorStyle } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesVisibilityStyle } from "./visibility";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}

export function useModelSurfacesStyle() {
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const modelSurfacesVisibilityStyle = useModelSurfacesVisibilityStyle();
  const modelSurfacesColorStyle = useModelSurfacesColorStyle();

  return {
    setModelSurfacesDefaultStyle,
    ...modelSurfacesCommonStyle,
    ...modelSurfacesVisibilityStyle,
    ...modelSurfacesColorStyle,
  };
}
