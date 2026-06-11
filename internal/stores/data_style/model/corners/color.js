import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVertexAttribute } from "./vertex";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

export function useModelCornersColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  function modelCornerColoring(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).coloring;
  }

  function modelCornerColor(id, corner_id) {
    return modelCornerColoring(id, corner_id).constant;
  }

  function setModelCornersColor(modelId, corners_ids, color, activeColoring = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, corners_ids, color, schema, activeColoring);
  }

  function modelCornerActiveColoring(id, corner_id) {
    return modelCornerColoring(id, corner_id).active;
  }

  async function setModelCornersActiveColoring(modelId, corners_ids, activeColoring) {
    await modelCommonStyle.mutateComponentStyles(modelId, corners_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelCornerColor(modelId, corners_ids[0]);
      return setModelCornersColor(modelId, corners_ids, color, activeColoring);
    }

    if (activeColoring === "vertex") {
      const name = modelCornersVertexAttribute.modelCornersVertexAttributeName(
        modelId,
        corners_ids[0],
      );
      await modelCornersVertexAttribute.setModelCornersVertexAttributeName(
        modelId,
        corners_ids,
        name,
      );
      const [min, max] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
        modelId,
        corners_ids[0],
      );
      await modelCornersVertexAttribute.setModelCornersVertexAttributeRange(
        modelId,
        corners_ids,
        min,
        max,
      );
      const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
        modelId,
        corners_ids[0],
      );
      await modelCornersVertexAttribute.setModelCornersVertexAttributeColorMap(
        modelId,
        corners_ids,
        colorMap,
      );
    }
  }

  return {
    setModelCornersColor,
    modelCornerColoring,
    modelCornerColor,
    modelCornerActiveColoring,
    setModelCornersActiveColoring,
  };
}
