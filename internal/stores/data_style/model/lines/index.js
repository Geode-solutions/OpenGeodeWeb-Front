import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColor } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesEdgeAttribute } from "./edge";
import { useModelLinesVertexAttribute } from "./vertex";
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

  async function applyModelLinesStyle(modelId) {
    const lines_ids = await dataStore.getLinesGeodeIds(modelId);
    if (!lines_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const line_id of lines_ids) {
      const style = modelCommonStyle.modelLineStyle(modelId, line_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(line_id);

      const coloring = modelColorStyle.modelLineColoring(modelId, line_id);
      const activeColoring = coloring.active;
      if (activeColoring === "constant") {
        const color = coloring.constant;
        const color_key = JSON.stringify(color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { activeColoring, color, lines_ids: [] };
        }
        colorGroups[color_key].lines_ids.push(line_id);
      } else if (activeColoring === "random") {
        if (!colorGroups["random"]) {
          colorGroups["random"] = { activeColoring, color: undefined, lines_ids: [] };
        }
        colorGroups["random"].lines_ids.push(line_id);
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
            lines_ids: [],
          };
        }
        attributeGroups[attributeGroupKey].lines_ids.push(line_id);
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelLinesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ activeColoring, color, lines_ids: ids }) =>
        modelColorStyle.setModelLinesColor(modelId, ids, color, activeColoring),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ activeColoring, name, minimum, maximum, colorMap, lines_ids: ids }) => {
          const isVertex = activeColoring === "vertex";
          const attributeStyle = isVertex ? modelLinesVertexAttribute : modelLinesEdgeAttribute;
          const setAttributeName = isVertex
            ? attributeStyle.setModelLinesVertexAttributeName
            : attributeStyle.setModelLinesEdgeAttributeName;
          const setAttributeRange = isVertex
            ? attributeStyle.setModelLinesVertexAttributeRange
            : attributeStyle.setModelLinesEdgeAttributeRange;
          const setAttributeColorMap = isVertex
            ? attributeStyle.setModelLinesVertexAttributeColorMap
            : attributeStyle.setModelLinesEdgeAttributeColorMap;

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
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelLinesVertexAttribute,
    ...modelLinesEdgeAttribute,
  };
}
