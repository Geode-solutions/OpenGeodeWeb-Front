import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
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

  function applyModelCornersVisibilityStyle(modelId, corners_ids) {
    const visibilityGroups = {};
    for (const corner_id of corners_ids) {
      const style = modelCommonStyle.modelCornerStyle(modelId, corner_id);
      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(corner_id);
    }
    return Object.entries(visibilityGroups).map(([visibility, ids]) =>
      modelVisibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
    );
  }

  function applyModelCornersColoringStyle(modelId, corners_ids) {
    const activeColoringGroups = {};
    for (const corner_id of corners_ids) {
      const activeColoring = modelColorStyle.modelCornerActiveColoring(modelId, corner_id);
      if (!activeColoringGroups[activeColoring]) {
        activeColoringGroups[activeColoring] = [];
      }
      activeColoringGroups[activeColoring].push(corner_id);
    }

    const coloringPromises = [];

    for (const [type, type_corners_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups = {};
        for (const corner_id of type_corners_ids) {
          const color = modelColorStyle.modelCornerColor(modelId, corner_id);
          const color_key = JSON.stringify(color);
          if (!colorGroups[color_key]) {
            colorGroups[color_key] = { color, corners_ids: [] };
          }
          colorGroups[color_key].corners_ids.push(corner_id);
        }
        coloringPromises.push(
          ...Object.values(colorGroups).map(({ color, corners_ids: ids }) =>
            modelColorStyle.setModelCornersColor(modelId, ids, color, "constant"),
          ),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelCornersColor(modelId, type_corners_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups = {};
        for (const corner_id of type_corners_ids) {
          const name = modelCornersVertexAttribute.modelCornersVertexAttributeName(
            modelId,
            corner_id,
          );
          const item = modelCornersVertexAttribute.modelCornersVertexAttributeItem(
            modelId,
            corner_id,
          );
          const [minimum, maximum] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
            modelId,
            corner_id,
          );
          const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
            modelId,
            corner_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelCornersVertexAttributeValid(attribute)) {
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
              corners_ids: [],
            };
          }
          vertexGroups[key].corners_ids.push(corner_id);
        }
        coloringPromises.push(
          ...Object.values(vertexGroups).map(
            ({ name, item, minimum, maximum, colorMap, corners_ids: ids }) =>
              modelCornersVertexAttribute.setModelCornersVertexAttribute(modelId, ids, {
                name,
                item,
                minimum,
                maximum,
                colorMap,
              }),
          ),
        );
      }
    }

    return Promise.all(coloringPromises);
  }

  async function applyModelCornersStyle(modelId) {
    const corners_ids = await dataStore.getCornersGeodeIds(modelId);
    if (corners_ids.length === 0) {
      return;
    }

    return Promise.all([
      applyModelCornersVisibilityStyle(modelId, corners_ids),
      applyModelCornersColoringStyle(modelId, corners_ids),
    ]);
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
