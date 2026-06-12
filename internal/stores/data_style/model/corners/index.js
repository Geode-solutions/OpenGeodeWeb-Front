import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVertexAttribute } from "./vertex";
import { useModelCornersVisibility } from "./visibility";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCornersCommonStyle();
  const modelVisibilityStyle = useModelCornersVisibility();
  const modelColorStyle = useModelCornersColor();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  async function applyModelCornersStyle(modelId) {
    const corners_ids = await dataStore.getCornersGeodeIds(modelId);
    if (!corners_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const corner_id of corners_ids) {
      const style = modelCommonStyle.modelCornerStyle(modelId, corner_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(corner_id);

      const coloring = modelColorStyle.modelCornerColoring(modelId, corner_id);
      const activeColoring = modelColorStyle.modelCornerActiveColoring(modelId, corner_id);
      if (activeColoring === "constant") {
        const color = modelColorStyle.modelCornerColor(modelId, corner_id);
        const color_key = JSON.stringify(color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { activeColoring, color, corners_ids: [] };
        }
        colorGroups[color_key].corners_ids.push(corner_id);
      } else if (activeColoring === "random") {
        if (!colorGroups["random"]) {
          colorGroups["random"] = { activeColoring, color: undefined, corners_ids: [] };
        }
        colorGroups["random"].corners_ids.push(corner_id);
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
            corners_ids: [],
          };
        }
        attributeGroups[attributeGroupKey].corners_ids.push(corner_id);
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ activeColoring, color, corners_ids: ids }) =>
        modelColorStyle.setModelCornersColor(modelId, ids, color, activeColoring),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ name, minimum, maximum, colorMap, corners_ids: ids }) => {
          const attribute = modelCornersVertexAttribute;
          const setAttributeName = attribute.setModelCornersVertexAttributeName;
          const setAttributeRange = attribute.setModelCornersVertexAttributeRange;
          const setAttributeColorMap = attribute.setModelCornersVertexAttributeColorMap;

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
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelCornersVertexAttribute,
  };
}
