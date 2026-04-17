import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibility } from "./visibility";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  const dataStore = useDataStore();
  const commonStyle = useModelCornersCommonStyle();
  const visibilityStyle = useModelCornersVisibility();
  const colorStyle = useModelCornersColor();

  async function applyModelCornersStyle(modelId) {
    const compIds = await dataStore.getCornersGeodeIds(modelId);
    if (!compIds?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const compId of compIds) {
      const style = commonStyle.modelCornerStyle(modelId, compId);

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
        visibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, compIds: ids }) =>
        colorStyle.setModelCornersColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...commonStyle,
    ...visibilityStyle,
    ...colorStyle,
  };
}
