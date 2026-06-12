import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesEdgeAttribute } from "./edge";
import { useModelLinesVertexAttribute } from "./vertex";
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
    await modelCommonStyle.mutateComponentStyles(modelId, lines_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelLineColor(modelId, lines_ids[0]);
      return setModelLinesColor(modelId, lines_ids, color, activeColoring);
    }

    if (activeColoring === "vertex") {
      const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, lines_ids[0]);
      await modelLinesVertexAttribute.setModelLinesVertexAttributeName(modelId, lines_ids, name);
      const [min, max] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
        modelId,
        lines_ids[0],
      );
      await modelLinesVertexAttribute.setModelLinesVertexAttributeRange(
        modelId,
        lines_ids,
        min,
        max,
      );
      const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(
        modelId,
        lines_ids[0],
      );
      await modelLinesVertexAttribute.setModelLinesVertexAttributeColorMap(
        modelId,
        lines_ids,
        colorMap,
      );
    } else if (activeColoring === "edge") {
      const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, lines_ids[0]);
      await modelLinesEdgeAttribute.setModelLinesEdgeAttributeName(modelId, lines_ids, name);
      const [min, max] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
        modelId,
        lines_ids[0],
      );
      await modelLinesEdgeAttribute.setModelLinesEdgeAttributeRange(modelId, lines_ids, min, max);
      const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(
        modelId,
        lines_ids[0],
      );
      await modelLinesEdgeAttribute.setModelLinesEdgeAttributeColorMap(
        modelId,
        lines_ids,
        colorMap,
      );
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
