// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColorStyle } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibilityStyle } from "./visibility";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const modelCornersVisibilityStyle = useModelCornersVisibilityStyle();
  const modelCornersColorStyle = useModelCornersColorStyle();

  async function applyModelCornersStyle(id) {
    const corner_ids = await dataStore.getCornersGeodeIds(id);
    if (corner_ids.length === 0) {
      return;
    }

    // Group corners by their effective style to minimize RPC calls
    const visibilityGroups = {};
    const colorGroups = {};

    for (const corner_id of corner_ids) {
      const style = modelCornersCommonStyle.modelCornerStyle(id, corner_id);

      // Group by visibility
      const vKey = String(style.visibility);
      if (!visibilityGroups[vKey]) {
        visibilityGroups[vKey] = [];
      }
      visibilityGroups[vKey].push(corner_id);

      const color_mode = style.color_mode || "constant";
      const cKey = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[cKey]) {
        colorGroups[cKey] = { color_mode, color: style.color, ids: [] };
      }
      colorGroups[cKey].ids.push(corner_id);
    }

    const promises = [];

    // Apply visibility groups
    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(
        modelCornersVisibilityStyle.setModelCornersVisibility(id, ids, vValue === "true"),
      );
    }

    for (const { color_mode, color, ids } of Object.values(colorGroups)) {
      promises.push(modelCornersColorStyle.setModelCornersColor(id, ids, color, color_mode));
    }

    return Promise.all(promises);
  }

  return {
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...modelCornersCommonStyle,
    ...modelCornersVisibilityStyle,
    ...modelCornersColorStyle,
  };
}
