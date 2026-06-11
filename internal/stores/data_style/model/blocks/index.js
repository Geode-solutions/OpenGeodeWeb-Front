import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import { useModelBlocksVertexAttribute } from "./vertex";
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
    if (!blocks_ids?.length) {
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
      const activeColoring = coloring.active;
      if (activeColoring === "constant") {
        const color = coloring.constant;
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
        const { name } = attributeStyle;
        const { minimum, maximum, colorMap } = attributeStyle.storedConfigs[name];
        const attributeGroupKey = `${activeColoring}_${name}_${colorMap}_${minimum}_${maximum}`;
        if (!attributeGroups[attributeGroupKey]) {
          attributeGroups[attributeGroupKey] = {
            activeColoring,
            name,
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
      ...Object.values(attributeGroups).flatMap(
        ({ activeColoring, name, minimum, maximum, colorMap, blocks_ids: ids }) => {
          const isVertex = activeColoring === "vertex";
          const attributeStyle = isVertex
            ? modelBlocksVertexAttribute
            : modelBlocksPolyhedronAttribute;
          const setAttributeName = isVertex
            ? attributeStyle.setModelBlocksVertexAttributeName
            : attributeStyle.setModelBlocksPolyhedronAttributeName;
          const setAttributeRange = isVertex
            ? attributeStyle.setModelBlocksVertexAttributeRange
            : attributeStyle.setModelBlocksPolyhedronAttributeRange;
          const setAttributeColorMap = isVertex
            ? attributeStyle.setModelBlocksVertexAttributeColorMap
            : attributeStyle.setModelBlocksPolyhedronAttributeColorMap;

          const list = [setAttributeName(modelId, ids, name)];
          if (minimum !== undefined && maximum !== undefined) {
            list.push(setAttributeRange(modelId, ids, minimum, maximum));
          }
          if (colorMap) {
            list.push(setAttributeColorMap(modelId, ids, colorMap));
          }
          return list;
        },
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
