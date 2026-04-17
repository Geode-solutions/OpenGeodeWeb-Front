import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesVisibility } from "./visibility";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}

export function useModelSurfacesStyle() {
  const dataStore = useDataStore();
  const commonStyle = useModelSurfacesCommonStyle();
  const visibilityStyle = useModelSurfacesVisibility();
  const colorStyle = useModelSurfacesColor();

  async function applyModelSurfacesStyle(modelId) {
    const compIds = await dataStore.getSurfacesGeodeIds(modelId);
    if (!compIds?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const compId of compIds) {
      const style = commonStyle.modelSurfaceStyle(modelId, compId);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(compId);

      const color_mode = style.color_mode || "constant";
      const cKey = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[cKey]) {
        colorGroups[cKey] = { color_mode, color: style.color, compIds: [] };
      }
      colorGroups[cKey].compIds.push(compId);
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        visibilityStyle.setModelSurfacesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, compIds: ids }) =>
        colorStyle.setModelSurfacesColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelSurfacesStyle,
    setModelSurfacesDefaultStyle,
    ...commonStyle,
    ...visibilityStyle,
    ...colorStyle,
  };
}
