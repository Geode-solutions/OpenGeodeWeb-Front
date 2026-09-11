import { isModelLinesEdgeAttributeValid, useModelLinesEdgeAttribute } from "./edge";
import { isModelLinesVertexAttributeValid, useModelLinesVertexAttribute } from "./vertex";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColor } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesVisibility } from "./visibility";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelLinesCommonStyle();
  const modelVisibilityStyle = useModelLinesVisibility();
  const modelColorStyle = useModelLinesColor();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();

  function applyModelLinesVisibilityStyle(modelId, lines_ids) {
    const visibilityGroups = {};
    for (const line_id of lines_ids) {
      const style = modelCommonStyle.modelLineStyle(modelId, line_id);
      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(line_id);
    }
    return Promise.all(
      Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelLinesVisibility(modelId, ids, visibility === "true"),
      ),
    );
  }

  function applyModelLinesColoringStyle(modelId, lines_ids) {
    const activeColoringGroups = {};
    for (const line_id of lines_ids) {
      const activeColoring = modelColorStyle.modelLineActiveColoring(modelId, line_id);
      if (!activeColoringGroups[activeColoring]) {
        activeColoringGroups[activeColoring] = [];
      }
      activeColoringGroups[activeColoring].push(line_id);
    }

    const coloringPromises = [];

    for (const [type, type_lines_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups = {};
        for (const line_id of type_lines_ids) {
          const color = modelColorStyle.modelLineColor(modelId, line_id);
          const color_key = JSON.stringify(color);
          if (!colorGroups[color_key]) {
            colorGroups[color_key] = { color, lines_ids: [] };
          }
          colorGroups[color_key].lines_ids.push(line_id);
        }
        coloringPromises.push(
          ...Object.values(colorGroups).map(({ color, lines_ids: ids }) =>
            modelColorStyle.setModelLinesColor(modelId, ids, color, "constant"),
          ),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelLinesColor(modelId, type_lines_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups = {};
        for (const line_id of type_lines_ids) {
          const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, line_id);
          const item = modelLinesVertexAttribute.modelLinesVertexAttributeItem(modelId, line_id);
          const [minimum, maximum] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
            modelId,
            line_id,
          );
          const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(
            modelId,
            line_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelLinesVertexAttributeValid(attribute)) {
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
              lines_ids: [],
            };
          }
          vertexGroups[key].lines_ids.push(line_id);
        }
        coloringPromises.push(
          ...Object.values(vertexGroups).map(
            ({ name, item, minimum, maximum, colorMap, lines_ids: ids }) =>
              modelLinesVertexAttribute.setModelLinesVertexAttribute(modelId, ids, {
                name,
                item,
                minimum,
                maximum,
                colorMap,
              }),
          ),
        );
      } else if (type === "edge") {
        const edgeGroups = {};
        for (const line_id of type_lines_ids) {
          const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, line_id);
          const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, line_id);
          const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
            modelId,
            line_id,
          );
          const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(
            modelId,
            line_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelLinesEdgeAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          if (!edgeGroups[key]) {
            edgeGroups[key] = {
              name,
              item,
              minimum,
              maximum,
              colorMap,
              lines_ids: [],
            };
          }
          edgeGroups[key].lines_ids.push(line_id);
        }
        coloringPromises.push(
          ...Object.values(edgeGroups).map(
            ({ name, item, minimum, maximum, colorMap, lines_ids: ids }) =>
              modelLinesEdgeAttribute.setModelLinesEdgeAttribute(modelId, ids, {
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

  async function applyModelLinesStyle(modelId) {
    const lines_ids = await dataStore.getLinesGeodeIds(modelId);
    if (lines_ids.length === 0) {
      return;
    }
    return Promise.all([
      applyModelLinesVisibilityStyle(modelId, lines_ids),
      applyModelLinesColoringStyle(modelId, lines_ids),
    ]);
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelLinesVertexAttribute,
    ...modelLinesEdgeAttribute,
  };
}
