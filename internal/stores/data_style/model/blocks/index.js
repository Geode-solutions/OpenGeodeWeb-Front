import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksVisibility } from "./visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  const dataStore = useDataStore();
  const commonStyle = useModelBlocksCommonStyle();
  const visibilityStyle = useModelBlocksVisibility();
  const colorStyle = useModelBlocksColor();

  async function applyModelBlocksStyle(modelId) {
    const compIds = await dataStore.getBlocksGeodeIds(modelId);
    if (!compIds?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const compId of compIds) {
      const style = commonStyle.modelBlockStyle(modelId, compId);

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
        visibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, compIds: ids }) =>
        colorStyle.setModelBlocksColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...commonStyle,
    ...visibilityStyle,
    ...colorStyle,
  };
}
