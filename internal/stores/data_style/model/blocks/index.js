import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksVisibility } from "./visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelBlocksCommonStyle();
  const modelVisibilityStyle = useModelBlocksVisibility();
  const modelColorStyle = useModelBlocksColor();

  async function applyModelBlocksStyle(modelId) {
    const blocks_ids = await dataStore.getBlocksGeodeIds(modelId);
    if (!blocks_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};

    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(block_id);

      const color_mode = style.color_mode || "constant";
      const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
      if (!colorGroups[color_key]) {
        colorGroups[color_key] = { color_mode, color: style.color, blocks_ids: [] };
      }
      colorGroups[color_key].blocks_ids.push(block_id);
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, blocks_ids: ids }) =>
        modelColorStyle.setModelBlocksColor(modelId, ids, color, color_mode),
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
  };
}
