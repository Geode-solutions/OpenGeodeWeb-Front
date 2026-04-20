import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColor } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesVisibility } from "./visibility";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelLinesCommonStyle();
  const modelVisibilityStyle = useModelLinesVisibility();
  const modelColorStyle = useModelLinesColor();

  async function applyModelLinesStyle(modelId) {
    const lines_ids = await dataStore.getLinesGeodeIds(modelId);
    if (!lines_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const line_id of lines_ids) {
      const style = modelCommonStyle.modelLineStyle(modelId, line_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(line_id);

      const color_mode = style.color_mode || "constant";
      const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[color_key]) {
        colorGroups[color_key] = { color_mode, color: style.color, lines_ids: [] };
      }
      colorGroups[color_key].lines_ids.push(line_id);
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelLinesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, lines_ids: ids }) =>
        modelColorStyle.setModelLinesColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
  };
}
