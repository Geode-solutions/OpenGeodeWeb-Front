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
    const vertexGroups = {};
    const polyhedronGroups = {};

    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(block_id);

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
      } else if (activeColoring === "vertex") {
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
      } else if (activeColoring === "polyhedron") {
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
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ activeColoring, color, blocks_ids: ids }) =>
        modelColorStyle.setModelBlocksColor(modelId, ids, color, activeColoring),
      ),
      ...Object.values(vertexGroups).map(
        ({ name, item, minimum, maximum, colorMap, blocks_ids: ids }) =>
          modelBlocksVertexAttribute.setModelBlocksVertexAttribute(modelId, ids, {
            name,
            item,
            minimum,
            maximum,
            colorMap,
          }),
      ),
      ...Object.values(polyhedronGroups).map(
        ({ name, item, minimum, maximum, colorMap, blocks_ids: ids }) =>
          modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(modelId, ids, {
            name,
            item,
            minimum,
            maximum,
            colorMap,
          }),
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
