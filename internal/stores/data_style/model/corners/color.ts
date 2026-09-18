import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

interface ModelCornersColorApi {
  setModelCornersColor: (
    modelId: string,
    corners_ids: string[],
    color: unknown,
    activeColoring?: string,
  ) => Promise<unknown>;
  modelCornerColoring: (id: string, corner_id?: string) => StyleValues;
  modelCornerColor: (id: string, corner_id?: string) => unknown;
  modelCornerActiveColoring: (id: string, corner_id?: string) => unknown;
  setModelCornersActiveColoring: (
    modelId: string,
    corners_ids: string[],
    activeColoring: string,
  ) => Promise<unknown>;
}

export function useModelCornersColor(): ModelCornersColorApi {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  function modelCornerColoring(id: string, corner_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring is a StyleValues sub-object stored under a StyleValues index signature.
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).coloring as StyleValues;
  }

  function modelCornerColor(id: string, corner_id?: string): unknown {
    return modelCornerColoring(id, corner_id).constant;
  }

  async function setModelCornersColor(
    modelId: string,
    corners_ids: string[],
    color: unknown,
    activeColoring = "constant",
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      corners_ids,
      color,
      schema,
      activeColoring,
    );
    return result;
  }

  function modelCornerActiveColoring(id: string, corner_id?: string): unknown {
    return modelCornerColoring(id, corner_id).active;
  }

  async function setModelCornersActiveColoring(
    modelId: string,
    corners_ids: string[],
    activeColoring: string,
  ): Promise<unknown> {
    if (corners_ids.length > 1) {
      await modelCornersCommonStyle.mutateModelCornersTypeColoring(modelId, {
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
    return undefined;
  }

  return {
    setModelCornersColor,
    modelCornerColoring,
    modelCornerColor,
    modelCornerActiveColoring,
    setModelCornersActiveColoring,
  };
}
