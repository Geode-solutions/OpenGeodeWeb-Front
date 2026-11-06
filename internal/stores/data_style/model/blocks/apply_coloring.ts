import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { DataId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelBlocksColor } from "./color";
import type { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import type { useModelBlocksVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelBlocksColor>;
type VertexAttributeStyle = ReturnType<typeof useModelBlocksVertexAttribute>;
type PolyhedronAttributeStyle = ReturnType<typeof useModelBlocksPolyhedronAttribute>;

function applyModelBlocksConstantColoring(
  modelId: DataId,
  type_blocks_ids: string[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const block_id of type_blocks_ids) {
    const color = modelColorStyle.modelBlockColor(modelId, block_id);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, blocks_ids: [] };
    colorGroups[color_key].blocks_ids.push(block_id);
  }
  return Object.values(colorGroups).map(async ({ color, blocks_ids: ids }) => {
    const result = await modelColorStyle.setModelBlocksColor(modelId, ids, color, "constant");
    return result;
  });
}

function groupModelBlocksVertexAttributes(
  modelId: DataId,
  type_blocks_ids: string[],
  modelBlocksVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const block_id of type_blocks_ids) {
    const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, block_id);
    const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, block_id);
    const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
      modelId,
      block_id,
    );
    const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
      modelId,
      block_id,
    );
    const no_data_color = modelBlocksVertexAttribute.modelBlocksVertexAttributeNoDataColor(
      modelId,
      block_id,
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
    vertexGroups[key] ??= { ...attribute, blocks_ids: [] };
    vertexGroups[key].blocks_ids.push(block_id);
  }
  return vertexGroups;
}

function applyModelBlocksVertexColoring(
  modelId: DataId,
  type_blocks_ids: string[],
  modelBlocksVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelBlocksVertexAttributes(
    modelId,
    type_blocks_ids,
    modelBlocksVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, blocks_ids: ids }) => {
      const result = await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(modelId, ids, {
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

function groupModelBlocksPolyhedronAttributes(
  modelId: DataId,
  type_blocks_ids: string[],
  modelBlocksPolyhedronAttribute: PolyhedronAttributeStyle,
): Record<string, AttributeGroup> {
  const polyhedronGroups: Record<string, AttributeGroup> = {};
  for (const block_id of type_blocks_ids) {
    const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
      modelId,
      block_id,
    );
    const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
      modelId,
      block_id,
    );
    const [minimum, maximum] = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(
      modelId,
      block_id,
    );
    const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
      modelId,
      block_id,
    );
    const no_data_color = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      block_id,
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
    polyhedronGroups[key] ??= { ...attribute, blocks_ids: [] };
    polyhedronGroups[key].blocks_ids.push(block_id);
  }
  return polyhedronGroups;
}

function applyModelBlocksPolyhedronColoring(
  modelId: DataId,
  type_blocks_ids: string[],
  modelBlocksPolyhedronAttribute: PolyhedronAttributeStyle,
): Promise<unknown>[] {
  const polyhedronGroups = groupModelBlocksPolyhedronAttributes(
    modelId,
    type_blocks_ids,
    modelBlocksPolyhedronAttribute,
  );
  return Object.values(polyhedronGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, blocks_ids: ids }) => {
      const result = await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
        modelId,
        ids,
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

export {
  applyModelBlocksConstantColoring,
  applyModelBlocksVertexColoring,
  applyModelBlocksPolyhedronColoring,
};
