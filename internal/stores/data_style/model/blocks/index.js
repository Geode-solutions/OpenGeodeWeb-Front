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

  function applyModelBlocksVisibilityStyle(modelId, blocks_ids) {
    const visibilityGroups = {};
    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);
      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(block_id);
    }
    return Object.entries(visibilityGroups).map(([visibility, ids]) =>
      modelVisibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
    );
  }

  function applyModelBlocksColoringStyle(modelId, blocks_ids) {
    const activeColoringGroups = {};
    for (const block_id of blocks_ids) {
      const activeColoring = modelColorStyle.modelBlockActiveColoring(modelId, block_id);
      if (!activeColoringGroups[activeColoring]) {
        activeColoringGroups[activeColoring] = [];
      }
      activeColoringGroups[activeColoring].push(block_id);
    }
    const promises = [];
    for (const [type, type_blocks_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups = {};
        for (const block_id of type_blocks_ids) {
          const color = modelColorStyle.modelBlockColor(modelId, block_id);
          const color_key = JSON.stringify(color);
          if (!colorGroups[color_key]) {
            colorGroups[color_key] = { color, blocks_ids: [] };
          }
          colorGroups[color_key].blocks_ids.push(block_id);
        }
        for (const { color, blocks_ids: ids } of Object.values(colorGroups)) {
          promises.push(modelColorStyle.setModelBlocksColor(modelId, ids, color, "constant"));
        }
      } else if (type === "random") {
        promises.push(
          modelColorStyle.setModelBlocksColor(modelId, type_blocks_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups = {};
        for (const block_id of type_blocks_ids) {
          const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, block_id);
          const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, block_id);
          const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
            modelId,
            block_id,
          );
          const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
            modelId,
            block_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelBlocksVertexAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          if (!vertexGroups[key]) {
            vertexGroups[key] = {
              name,
              item,
              minimum,
              maximum,
              colorMap,
              blocks_ids: [],
            };
          }
          vertexGroups[key].blocks_ids.push(block_id);
        }
        for (const { name, item, minimum, maximum, colorMap, blocks_ids: ids } of Object.values(
          vertexGroups,
        )) {
          promises.push(
            modelBlocksVertexAttribute.setModelBlocksVertexAttribute(modelId, ids, {
              name,
              item,
              minimum,
              maximum,
              colorMap,
            }),
          );
        }
      } else if (type === "polyhedron") {
        const polyhedronGroups = {};
        for (const block_id of type_blocks_ids) {
          const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
            modelId,
            block_id,
          );
          const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
            modelId,
            block_id,
          );
          const [minimum, maximum] =
            modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(modelId, block_id);
          const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
            modelId,
            block_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelBlocksPolyhedronAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          if (!polyhedronGroups[key]) {
            polyhedronGroups[key] = {
              name,
              item,
              minimum,
              maximum,
              colorMap,
              blocks_ids: [],
            };
          }
          polyhedronGroups[key].blocks_ids.push(block_id);
        }
        for (const { name, item, minimum, maximum, colorMap, blocks_ids: ids } of Object.values(
          polyhedronGroups,
        )) {
          promises.push(
            modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(modelId, ids, {
              name,
              item,
              minimum,
              maximum,
              colorMap,
            }),
          );
        }
      }
    }
    return promises;
  }

  async function applyModelBlocksStyle(modelId) {
    const blocks_ids = await dataStore.getBlocksGeodeIds(modelId);
    if (blocks_ids.length === 0) {
      return;
    }

    return Promise.all([
      ...applyModelBlocksVisibilityStyle(modelId, blocks_ids),
      ...applyModelBlocksColoringStyle(modelId, blocks_ids),
    ]);
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
