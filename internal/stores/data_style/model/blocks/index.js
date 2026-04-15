// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColorStyle } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksVisibilityStyle } from "./visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const modelBlocksVisibilityStyle = useModelBlocksVisibilityStyle();
  const modelBlocksColorStyle = useModelBlocksColorStyle();

  async function applyModelBlocksStyle(id) {
    const block_ids = await dataStore.getBlocksGeodeIds(id);
    if (block_ids.length === 0) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const block_id of block_ids) {
      const style = modelBlocksCommonStyle.modelBlockStyle(id, block_id);

      const vKey = String(style.visibility);
      if (!visibilityGroups[vKey]) {
        visibilityGroups[vKey] = [];
      }
      visibilityGroups[vKey].push(block_id);

      const color_mode = style.color_mode || "constant";
      const cKey = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[cKey]) {
        colorGroups[cKey] = { color_mode, color: style.color, ids: [] };
      }
      colorGroups[cKey].ids.push(block_id);
    }

    const promises = [];

    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(
        modelBlocksVisibilityStyle.setModelBlocksVisibility(id, ids, vValue === "true"),
      );
    }

    for (const { color_mode, color, ids } of Object.values(colorGroups)) {
      promises.push(modelBlocksColorStyle.setModelBlocksColor(id, ids, color, color_mode));
    }

    return Promise.all(promises);
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...modelBlocksCommonStyle,
    ...modelBlocksVisibilityStyle,
    ...modelBlocksColorStyle,
  };
}
