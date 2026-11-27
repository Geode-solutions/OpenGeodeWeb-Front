import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelLinesColor } from "./color";
import type { useModelLinesEdgeAttribute } from "./edge";
import type { useModelLinesVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelLinesColor>;
type VertexAttributeStyle = ReturnType<typeof useModelLinesVertexAttribute>;
type EdgeAttributeStyle = ReturnType<typeof useModelLinesEdgeAttribute>;

function applyModelLinesConstantColoring(
  modelId: ModelId,
  typeLinesIds: LineId[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const lineId of typeLinesIds) {
    const color = modelColorStyle.modelLineColor(modelId, lineId);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, lineIds: [] };
    colorGroups[color_key].lineIds.push(lineId);
  }
  return Object.values(colorGroups).map(async ({ color, lineIds }) => {
    const result = await modelColorStyle.setModelLinesColor(modelId, lineIds, color, "constant");
    return result;
  });
}

function groupModelLinesVertexAttributes(
  modelId: ModelId,
  typeLinesIds: LineId[],
  modelLinesVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const lineId of typeLinesIds) {
    const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttribute.modelLinesVertexAttributeItem(modelId, lineId);
    const [minimum, maximum] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
      modelId,
      lineId,
    );
    const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(modelId, lineId);
    const no_data_color = modelLinesVertexAttribute.modelLinesVertexAttributeNoDataColor(
      modelId,
      lineId,
    );
    const attribute = {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color,
    };
    if (!isAttributeValid(attribute)) {
      continue;
    }
    const key = [name, item, colorMap, minimum, maximum, JSON.stringify(no_data_color)].join("_");
    const group = vertexGroups[key];
    if (group === undefined) {
      vertexGroups[key] = { ...attribute, lineIds: [lineId] };
    } else {
      group.lineIds.push(lineId);
    }
  }
  return vertexGroups;
}

function applyModelLinesVertexColoring(
  modelId: ModelId,
  typeLinesIds: LineId[],
  modelLinesVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelLinesVertexAttributes(
    modelId,
    typeLinesIds,
    modelLinesVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, lineIds }) => {
      const result = await modelLinesVertexAttribute.setModelLinesVertexAttribute(
        modelId,
        lineIds,
        {
          name,
          item,
          minimum,
          maximum,
          colorMap,
          no_data_color,
        },
      );
      return result;
    },
  );
}

function groupModelLinesEdgeAttributes(
  modelId: ModelId,
  typeLinesIds: LineId[],
  modelLinesEdgeAttribute: EdgeAttributeStyle,
): Record<string, AttributeGroup> {
  const edgeGroups: Record<string, AttributeGroup> = {};
  for (const lineId of typeLinesIds) {
    const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, lineId);
    const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
      modelId,
      lineId,
    );
    const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(modelId, lineId);
    const no_data_color = modelLinesEdgeAttribute.modelLinesEdgeAttributeNoDataColor(
      modelId,
      lineId,
    );
    const attribute = {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color,
    };
    if (!isAttributeValid(attribute)) {
      continue;
    }
    const key = [name, item, colorMap, minimum, maximum, JSON.stringify(no_data_color)].join("_");
    const group = edgeGroups[key];
    if (group === undefined) {
      edgeGroups[key] = { ...attribute, lineIds: [lineId] };
    } else {
      group.lineIds.push(lineId);
    }
  }
  return edgeGroups;
}

function applyModelLinesEdgeColoring(
  modelId: ModelId,
  typeLinesIds: LineId[],
  modelLinesEdgeAttribute: EdgeAttributeStyle,
): Promise<unknown>[] {
  const edgeGroups = groupModelLinesEdgeAttributes(modelId, typeLinesIds, modelLinesEdgeAttribute);
  return Object.values(edgeGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, lineIds }) => {
      const result = await modelLinesEdgeAttribute.setModelLinesEdgeAttribute(modelId, lineIds, {
        name,
        item,
        minimum,
        maximum,
        colorMap,
        no_data_color,
      });
      return result;
    },
  );
}

export {
  applyModelLinesConstantColoring,
  applyModelLinesVertexColoring,
  applyModelLinesEdgeColoring,
};
