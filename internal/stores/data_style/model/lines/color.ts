import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { ColoringType } from "@ogw_front/types/attribute";
import type { GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesEdgeAttribute } from "./edge";
import { useModelLinesVertexAttribute } from "./vertex";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.color;

export function useModelLinesColor(): {
  setModelLinesColor: (
    modelId: ModelId,
    lineIds: LineId[],
    color: ColorRGBA | undefined,
    activeColoring?: ColoringType,
    collectionId?: GeodeId,
  ) => Promise<unknown>;
  modelLineColoring: (modelId: ModelId, line_id?: LineId) => StyleValues;
  modelLineColor: (modelId: ModelId, line_id?: LineId) => ColorRGBA | undefined;
  modelLineActiveColoring: (modelId: ModelId, line_id?: LineId) => unknown;
  setModelLinesActiveColoring: (
    modelId: ModelId,
    lineIds: NonEmptyArray<LineId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();

  function modelLineColoring(modelId: ModelId, line_id?: LineId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineStyle(modelId, line_id).coloring as StyleValues;
  }

  function modelLineColor(modelId: ModelId, line_id?: LineId): ColorRGBA | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelLineColoring(modelId, line_id).constant as ColorRGBA | undefined;
  }

  async function setModelLinesColor(
    modelId: ModelId,
    lineIds: LineId[],
    color: ColorRGBA | undefined,
    activeColoring = "constant",
    collectionId?: GeodeId,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      lineIds,
      color,
      schema,
      activeColoring,
      collectionId,
    );
    return result;
  }

  function modelLineActiveColoring(modelId: ModelId, line_id?: LineId): unknown {
    return modelLineColoring(modelId, line_id).active;
  }

  async function applyVertexColoring(
    modelId: ModelId,
    lineIds: NonEmptyArray<LineId>,
  ): Promise<unknown> {
    const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttribute.modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const [minimum, maximum] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
      modelId,
      lineIds[0],
    );
    const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(
      modelId,
      lineIds[0],
    );
    const no_data_color = modelLinesVertexAttribute.modelLinesVertexAttributeNoDataColor(
      modelId,
      lineIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelLinesVertexAttribute.setModelLinesVertexAttribute(
        modelId,
        lineIds,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function applyEdgeColoring(
    modelId: ModelId,
    lineIds: NonEmptyArray<LineId>,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
      modelId,
      lineIds[0],
    );
    const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const no_data_color = modelLinesEdgeAttribute.modelLinesEdgeAttributeNoDataColor(
      modelId,
      lineIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelLinesEdgeAttribute.setModelLinesEdgeAttribute(
        modelId,
        lineIds,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function setModelLinesActiveColoring(
    modelId: ModelId,
    lineIds: NonEmptyArray<LineId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
  ): Promise<unknown> {
    const totalLineIds = await dataStore.getLinesGeodeIds(modelId);
    if (lineIds.length === totalLineIds.length) {
      await modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, lineIds, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelLineColor(modelId, lineIds[0]);
      return setModelLinesColor(modelId, lineIds, color, activeColoring, collectionId);
    }

    if (activeColoring === "vertex") {
      return applyVertexColoring(modelId, lineIds);
    } else if (activeColoring === "edge") {
      return applyEdgeColoring(modelId, lineIds);
    }
    return undefined;
  }

  return {
    setModelLinesColor,
    modelLineColoring,
    modelLineColor,
    modelLineActiveColoring,
    setModelLinesActiveColoring,
  };
}
