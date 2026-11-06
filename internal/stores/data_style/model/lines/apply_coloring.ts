import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { DataId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelLinesColor } from "./color";
import type { useModelLinesEdgeAttribute } from "./edge";
import type { useModelLinesVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelLinesColor>;
type VertexAttributeStyle = ReturnType<typeof useModelLinesVertexAttribute>;
type EdgeAttributeStyle = ReturnType<typeof useModelLinesEdgeAttribute>;

function applyModelLinesConstantColoring(
  modelId: DataId,
  type_lines_ids: string[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const line_id of type_lines_ids) {
    const color = modelColorStyle.modelLineColor(modelId, line_id);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, lines_ids: [] };
    colorGroups[color_key].lines_ids.push(line_id);
  }
  return Object.values(colorGroups).map(async ({ color, lines_ids: ids }) => {
    const result = await modelColorStyle.setModelLinesColor(modelId, ids, color, "constant");
    return result;
  });
}

function groupModelLinesVertexAttributes(
  modelId: DataId,
  type_lines_ids: string[],
  modelLinesVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const line_id of type_lines_ids) {
    const name = modelLinesVertexAttribute.modelLinesVertexAttributeName(modelId, line_id);
    const item = modelLinesVertexAttribute.modelLinesVertexAttributeItem(modelId, line_id);
    const [minimum, maximum] = modelLinesVertexAttribute.modelLinesVertexAttributeRange(
      modelId,
      line_id,
    );
    const colorMap = modelLinesVertexAttribute.modelLinesVertexAttributeColorMap(modelId, line_id);
    const no_data_color = modelLinesVertexAttribute.modelLinesVertexAttributeNoDataColor(
      modelId,
      line_id,
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
    vertexGroups[key] ??= { ...attribute, lines_ids: [] };
    vertexGroups[key].lines_ids.push(line_id);
  }
  return vertexGroups;
}

function applyModelLinesVertexColoring(
  modelId: DataId,
  type_lines_ids: string[],
  modelLinesVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelLinesVertexAttributes(
    modelId,
    type_lines_ids,
    modelLinesVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, lines_ids: ids }) => {
      const result = await modelLinesVertexAttribute.setModelLinesVertexAttribute(modelId, ids, {
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

function groupModelLinesEdgeAttributes(
  modelId: DataId,
  type_lines_ids: string[],
  modelLinesEdgeAttribute: EdgeAttributeStyle,
): Record<string, AttributeGroup> {
  const edgeGroups: Record<string, AttributeGroup> = {};
  for (const line_id of type_lines_ids) {
    const name = modelLinesEdgeAttribute.modelLinesEdgeAttributeName(modelId, line_id);
    const item = modelLinesEdgeAttribute.modelLinesEdgeAttributeItem(modelId, line_id);
    const [minimum, maximum] = modelLinesEdgeAttribute.modelLinesEdgeAttributeRange(
      modelId,
      line_id,
    );
    const colorMap = modelLinesEdgeAttribute.modelLinesEdgeAttributeColorMap(modelId, line_id);
    const no_data_color = modelLinesEdgeAttribute.modelLinesEdgeAttributeNoDataColor(
      modelId,
      line_id,
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
    edgeGroups[key] ??= { ...attribute, lines_ids: [] };
    edgeGroups[key].lines_ids.push(line_id);
  }
  return edgeGroups;
}

function applyModelLinesEdgeColoring(
  modelId: DataId,
  type_lines_ids: string[],
  modelLinesEdgeAttribute: EdgeAttributeStyle,
): Promise<unknown>[] {
  const edgeGroups = groupModelLinesEdgeAttributes(
    modelId,
    type_lines_ids,
    modelLinesEdgeAttribute,
  );
  return Object.values(edgeGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, lines_ids: ids }) => {
      const result = await modelLinesEdgeAttribute.setModelLinesEdgeAttribute(modelId, ids, {
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
