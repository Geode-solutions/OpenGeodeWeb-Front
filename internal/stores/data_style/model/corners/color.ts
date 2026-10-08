import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

interface ModelCornersColorApi {
  setModelCornersColor: (
    modelId: string,
    corners_ids: string[],
    color: RGBAColor | undefined,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  modelCornerColoring: (id: string, corner_id?: string) => StyleValues;
  modelCornerColor: (id: string, corner_id?: string) => RGBAColor | undefined;
  modelCornerActiveColoring: (id: string, corner_id?: string) => unknown;
  setModelCornersActiveColoring: (
    modelId: string,
    corners_ids: string[],
    activeColoring: string,
    collectionId?: string,
  ) => Promise<unknown>;
}

export function useModelCornersColor(): ModelCornersColorApi {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  function modelCornerColoring(id: string, corner_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring is a StyleValues sub-object stored under a StyleValues index signature.
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).coloring as StyleValues;
  }

  function modelCornerColor(id: string, corner_id?: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelCornerColoring(id, corner_id).constant as RGBAColor | undefined;
  }

  async function setModelCornersColor(
    modelId: string,
    corners_ids: string[],
    color: RGBAColor | undefined,
    activeColoring = "constant",
    collectionId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      corners_ids,
      color,
      schema,
      activeColoring,
      collectionId,
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
    collectionId?: string,
  ): Promise<unknown> {
    const totalCornerIds = await dataStore.getCornersGeodeIds(modelId);
    if (corners_ids.length === totalCornerIds.length) {
      await modelCornersCommonStyle.mutateModelCornersTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, corners_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelCornerColor(modelId, corners_ids[0]);
      return setModelCornersColor(modelId, corners_ids, color, activeColoring, collectionId);
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
      const no_data_color = modelCornersVertexAttribute.modelCornersVertexAttributeNoDataColor(
        modelId,
        corners_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
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
