import { isModelLinesEdgeAttributeValid, useModelLinesEdgeAttribute } from "./edge";
import { isModelLinesVertexAttributeValid, useModelLinesVertexAttribute } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.color;

export function useModelLinesColor(): {
  setModelLinesColor: (
    modelId: string,
    lines_ids: string[],
    color: unknown,
    activeColoring?: string,
    colorId?: string,
  ) => Promise<unknown>;
  modelLineColoring: (id: string, line_id?: string) => StyleValues;
  modelLineColor: (id: string, line_id?: string) => unknown;
  modelLineActiveColoring: (id: string, line_id?: string) => unknown;
  setModelLinesActiveColoring: (
    modelId: string,
    lines_ids: string[],
    activeColoring: string,
    colorId?: string,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();

  function modelLineColoring(id: string, line_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineStyle(id, line_id).coloring as StyleValues;
  }

  function modelLineColor(id: string, line_id?: string): unknown {
    return modelLineColoring(id, line_id).constant;
  }

  async function setModelLinesColor(
    modelId: string,
    lines_ids: string[],
    color: unknown,
    activeColoring = "constant",
    colorId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      lines_ids,
      color,
      schema,
      activeColoring,
      colorId,
    );
    return result;
  }

  function modelLineActiveColoring(id: string, line_id?: string): unknown {
    return modelLineColoring(id, line_id).active;
  }

  async function setModelLinesActiveColoring(
    modelId: string,
    lines_ids: string[],
    activeColoring: string,
    colorId?: string,
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
      return setModelLinesColor(modelId, lines_ids, color, activeColoring, colorId);
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
