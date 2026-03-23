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

      const cKey = JSON.stringify(style.color);
      if (!colorGroups[cKey]) {
        colorGroups[cKey] = [];
      }
      colorGroups[cKey].push(block_id);
    }

    const promises = [];

    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(
        modelBlocksVisibilityStyle.setModelBlocksVisibility(id, ids, vValue === "true"),
      );
    }

    for (const [cValue, ids] of Object.entries(colorGroups)) {
      promises.push(modelBlocksColorStyle.setModelBlocksColor(id, ids, JSON.parse(cValue)));
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
