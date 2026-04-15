// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColorStyle } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesVisibilityStyle } from "./visibility";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVisibilityStyle = useModelLinesVisibilityStyle();
  const modelLinesColorStyle = useModelLinesColorStyle();

  async function applyModelLinesStyle(id) {
    const line_ids = await dataStore.getLinesGeodeIds(id);
    if (line_ids.length === 0) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const line_id of line_ids) {
      const style = modelLinesCommonStyle.modelLineStyle(id, line_id);

      const vKey = String(style.visibility);
      if (!visibilityGroups[vKey]) {
        visibilityGroups[vKey] = [];
      }
      visibilityGroups[vKey].push(line_id);

      const color_mode = style.color_mode || "constant";
      const cKey = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[cKey]) {
        colorGroups[cKey] = { color_mode, color: style.color, ids: [] };
      }
      colorGroups[cKey].ids.push(line_id);
    }

    const promises = [];

    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(modelLinesVisibilityStyle.setModelLinesVisibility(id, ids, vValue === "true"));
    }

    for (const { color_mode, color, ids } of Object.values(colorGroups)) {
      promises.push(modelLinesColorStyle.setModelLinesColor(id, ids, color, color_mode));
    }

    return Promise.all(promises);
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelLinesCommonStyle,
    ...modelLinesVisibilityStyle,
    ...modelLinesColorStyle,
  };
}
