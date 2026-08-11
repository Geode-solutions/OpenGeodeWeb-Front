import { isModelLinesEdgeAttributeValid, useModelLinesEdgeAttribute } from "./edge";
import { isModelLinesVertexAttributeValid, useModelLinesVertexAttribute } from "./vertex";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.color;

export function useModelLinesColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();

  function modelLineColoring(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).coloring;
  }

  function modelLineColor(id, line_id) {
    return modelLineColoring(id, line_id).constant;
  }

  function setModelLinesColor(modelId, lines_ids, color, activeColoring = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, lines_ids, color, schema, activeColoring);
  }

  function modelLineActiveColoring(id, line_id) {
    return modelLineColoring(id, line_id).active;
  }

  async function setModelLinesActiveColoring(modelId, lines_ids, activeColoring) {
    if (lines_ids.length > 1) {
      modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, lines_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelLineColor(modelId, lines_ids[0]);
      return setModelLinesColor(modelId, lines_ids, color, activeColoring);
    }

    if (activeColoring === "vertex") {
      const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, lines_ids[0]);
      const item = modelLinesVertexAttribute.modelLinesVertexAttributeItem(modelId, lines_ids[0]);
      const [minimum, maximum] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
        modelId,
        lines_ids[0],
      );
      const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(
        modelId,
        lines_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelLinesVertexAttributeValid(attribute)) {
        return modelLinesVertexAttribute.setModelLinesVertexAttribute(
          modelId,
          lines_ids,
          attribute,
        );
      }
    } else if (activeColoring === "edge") {
      const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, lines_ids[0]);
      const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, lines_ids[0]);
      const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
        modelId,
        lines_ids[0],
      );
      const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(
        modelId,
        lines_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelLinesEdgeAttributeValid(attribute)) {
        return modelLinesEdgeAttribute.setModelLinesEdgeAttribute(modelId, lines_ids, attribute);
      }
    }
  }

  return {
    setModelLinesColor,
    modelLineColoring,
    modelLineColor,
    modelLineActiveColoring,
    setModelLinesActiveColoring,
  };
}
