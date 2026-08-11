import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
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
    if (corners_ids.length > 1) {
      modelCornersCommonStyle.mutateModelCornersTypeColoring(modelId, {
        active: activeColoring,
      });
    }
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
      const item = modelCornersVertexAttribute.modelCornersVertexAttributeItem(
        modelId,
        corners_ids[0],
      );
      const [minimum, maximum] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
        modelId,
        corners_ids[0],
      );
      const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
        modelId,
        corners_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelCornersVertexAttributeValid(attribute)) {
        return modelCornersVertexAttribute.setModelCornersVertexAttribute(
          modelId,
          corners_ids,
          attribute,
        );
      }
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
