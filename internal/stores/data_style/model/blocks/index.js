import {
  isModelBlocksPolyhedronAttributeValid,
  useModelBlocksPolyhedronAttribute,
} from "./polyhedron";
import { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute } from "./vertex";
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
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();

  async function applyModelBlocksStyle(modelId) {
    const blocks_ids = await dataStore.getBlocksGeodeIds(modelId);
    if (blocks_ids.length === 0) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(block_id);

      const coloring = modelColorStyle.modelBlockColoring(modelId, block_id);
      const activeColoring = modelColorStyle.modelBlockActiveColoring(modelId, block_id);
      if (activeColoring === "constant") {
        const color = modelColorStyle.modelBlockColor(modelId, block_id);
        const color_key = JSON.stringify(color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { activeColoring, color, blocks_ids: [] };
        }
        colorGroups[color_key].blocks_ids.push(block_id);
      } else if (activeColoring === "random") {
        if (!colorGroups["random"]) {
          colorGroups["random"] = { activeColoring, color: undefined, blocks_ids: [] };
        }
        colorGroups["random"].blocks_ids.push(block_id);
      } else {
        const attributeStyle = coloring[activeColoring];
        const { name, item } = attributeStyle;
        const setAttribute =
          activeColoring === "vertex"
            ? modelBlocksVertexAttribute.setModelBlocksVertexAttribute
            : modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute;
        const storedConfig =
          activeColoring === "vertex"
            ? modelBlocksVertexAttribute.modelBlocksVertexAttributeStoredConfig(
                modelId,
                block_id,
                name,
                item,
              )
            : modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeStoredConfig(
                modelId,
                block_id,
                name,
                item,
              );
        const { minimum, maximum, colorMap } = storedConfig;
        const attribute = { name, item, minimum, maximum, colorMap };
        const isValid =
          activeColoring === "vertex"
            ? isModelBlocksVertexAttributeValid(attribute)
            : isModelBlocksPolyhedronAttributeValid(attribute);
        if (!isValid) {
          continue;
        }
        const attributeGroupKey = `${activeColoring}_${name}_${colorMap}_${minimum}_${maximum}`;
        if (!attributeGroups[attributeGroupKey]) {
          attributeGroups[attributeGroupKey] = {
            setAttribute,
            name,
            item,
            minimum,
            maximum,
            colorMap,
            blocks_ids: [],
          };
        }
        attributeGroups[attributeGroupKey].blocks_ids.push(block_id);
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ activeColoring, color, blocks_ids: ids }) =>
        modelColorStyle.setModelBlocksColor(modelId, ids, color, activeColoring),
      ),
      ...Object.values(attributeGroups).map(
        ({ setAttribute, name, item, minimum, maximum, colorMap, blocks_ids: ids }) =>
          setAttribute(modelId, ids, { name, item, minimum, maximum, colorMap }),
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
    ...modelBlocksVertexAttribute,
    ...modelBlocksPolyhedronAttribute,
  };
}
