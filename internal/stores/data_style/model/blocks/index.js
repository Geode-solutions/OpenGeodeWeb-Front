import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksPolyhedronAttributeStyle } from "./polyhedron";
import { useModelBlocksVertexAttributeStyle } from "./vertex";
import { useModelBlocksVisibility } from "./visibility";

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder
}

export function useModelBlocksStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelBlocksCommonStyle();
  const modelVisibilityStyle = useModelBlocksVisibility();
  const modelColorStyle = useModelBlocksColor();
  const modelBlocksVertexAttributeStyle = useModelBlocksVertexAttributeStyle();
  const modelBlocksPolyhedronAttributeStyle = useModelBlocksPolyhedronAttributeStyle();

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

      const color_mode = style.color_mode || "constant";
      if (color_mode === "constant" || color_mode === "random") {
        const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { color_mode, color: style.color, blocks_ids: [] };
        }
        colorGroups[color_key].blocks_ids.push(block_id);
      } else {
        const attributeTypeKey = `${color_mode}_attribute`;
        const attributeStyle = style[attributeTypeKey] || {};
        const { name } = attributeStyle;
        if (name) {
          const storedConfig = (attributeStyle.storedConfigs && attributeStyle.storedConfigs[name]) || {};
          const { minimum, maximum, colorMap } = storedConfig;
          const attributeGroupKey = `${color_mode}_${name}_${colorMap}_${minimum}_${maximum}`;
          if (!attributeGroups[attributeGroupKey]) {
            attributeGroups[attributeGroupKey] = {
              color_mode,
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
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelBlocksVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, blocks_ids: ids }) =>
        modelColorStyle.setModelBlocksColor(modelId, ids, color, color_mode),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ color_mode, name, minimum, maximum, colorMap, blocks_ids: ids }) => {
          const isVertex = color_mode === "vertex";
          const attributeStyle = isVertex
            ? modelBlocksVertexAttributeStyle
            : modelBlocksPolyhedronAttributeStyle;
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
    ...modelBlocksVertexAttributeStyle,
    ...modelBlocksPolyhedronAttributeStyle,
  };
}
