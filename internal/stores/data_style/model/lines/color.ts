import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
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
    lines_ids: ModelComponentId[],
    color: RGBAColor | undefined,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  modelLineColoring: (modelId: ModelId, line_id?: ModelComponentId) => StyleValues;
  modelLineColor: (modelId: ModelId, line_id?: ModelComponentId) => RGBAColor | undefined;
  modelLineActiveColoring: (modelId: ModelId, line_id?: ModelComponentId) => unknown;
  setModelLinesActiveColoring: (
    modelId: ModelId,
    lines_ids: ModelComponentId[],
    activeColoring: string,
    collectionId?: string,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();

  function modelLineColoring(modelId: ModelId, line_id?: ModelComponentId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineStyle(modelId, line_id).coloring as StyleValues;
  }

  function modelLineColor(modelId: ModelId, line_id?: ModelComponentId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelLineColoring(modelId, line_id).constant as RGBAColor | undefined;
  }

  async function setModelLinesColor(
    modelId: ModelId,
    lines_ids: ModelComponentId[],
    color: RGBAColor | undefined,
    activeColoring = "constant",
    collectionId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      lines_ids,
      color,
      schema,
      activeColoring,
      collectionId,
    );
    return result;
  }

  function modelLineActiveColoring(modelId: ModelId, line_id?: ModelComponentId): unknown {
    return modelLineColoring(modelId, line_id).active;
  }

  async function applyVertexColoring(
    modelId: ModelId,
    lines_ids: ModelComponentId[],
  ): Promise<unknown> {
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
    const no_data_color = modelLinesVertexAttribute.modelLinesVertexAttributeNoDataColor(
      modelId,
      lines_ids[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelLinesVertexAttribute.setModelLinesVertexAttribute(
        modelId,
        lines_ids,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function applyEdgeColoring(
    modelId: ModelId,
    lines_ids: ModelComponentId[],
  ): Promise<unknown> {
    const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, lines_ids[0]);
    const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, lines_ids[0]);
    const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
      modelId,
      lines_ids[0],
    );
    const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(modelId, lines_ids[0]);
    const no_data_color = modelLinesEdgeAttribute.modelLinesEdgeAttributeNoDataColor(
      modelId,
      lines_ids[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelLinesEdgeAttribute.setModelLinesEdgeAttribute(
        modelId,
        lines_ids,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function setModelLinesActiveColoring(
    modelId: ModelId,
    lines_ids: ModelComponentId[],
    activeColoring: string,
    collectionId?: string,
  ): Promise<unknown> {
    const totalLineIds = await dataStore.getLinesGeodeIds(modelId);
    if (lines_ids.length === totalLineIds.length) {
      await modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, lines_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelLineColor(modelId, lines_ids[0]);
      return setModelLinesColor(modelId, lines_ids, color, activeColoring, collectionId);
    }

    if (activeColoring === "vertex") {
      return applyVertexColoring(modelId, lines_ids);
    } else if (activeColoring === "edge") {
      return applyEdgeColoring(modelId, lines_ids);
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
