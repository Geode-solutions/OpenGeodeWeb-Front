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
    const corners_ids = await dataStore.getCornersGeodeIds(modelId);
    if (!corners_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const corner_id of corners_ids) {
      const style = commonStyle.modelCornerStyle(modelId, corner_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(corner_id);

      const color_mode = style.color_mode || "constant";
      const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[color_key]) {
        colorGroups[color_key] = { color_mode, color: style.color, corners_ids: [] };
      }
      colorGroups[color_key].corners_ids.push(corner_id);
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        visibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, corners_ids: ids }) =>
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
