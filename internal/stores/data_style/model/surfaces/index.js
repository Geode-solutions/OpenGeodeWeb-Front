import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesVisibility } from "./visibility";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}

export function useModelSurfacesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelSurfacesCommonStyle();
  const modelVisibilityStyle = useModelSurfacesVisibility();
  const modelColorStyle = useModelSurfacesColor();

  async function applyModelSurfacesStyle(modelId) {
    const surfaces_ids = await dataStore.getSurfacesGeodeIds(modelId);
    if (!surfaces_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const surfaces_id of surfaces_ids) {
      const style = modelCommonStyle.modelSurfaceStyle(modelId, surfaces_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(surfaces_id);

      const color_mode = style.color_mode || "constant";
      const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[color_key]) {
        colorGroups[color_key] = { color_mode, color: style.color, surfaces_ids: [] };
      }
      colorGroups[color_key].surfaces_ids.push(surfaces_id);
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelSurfacesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, surfaces_ids: ids }) =>
        modelColorStyle.setModelSurfacesColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelSurfacesStyle,
    setModelSurfacesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
  };
}
