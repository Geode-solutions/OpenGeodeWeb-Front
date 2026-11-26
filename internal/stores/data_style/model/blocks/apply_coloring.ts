import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { BlockId, ModelId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelBlocksColor } from "./color";
import type { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import type { useModelBlocksVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelBlocksColor>;
type VertexAttributeStyle = ReturnType<typeof useModelBlocksVertexAttribute>;
type PolyhedronAttributeStyle = ReturnType<typeof useModelBlocksPolyhedronAttribute>;

function applyModelBlocksConstantColoring(
  modelId: ModelId,
  typeBlocksIds: BlockId[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const blockId of typeBlocksIds) {
    const color = modelColorStyle.modelBlockColor(modelId, blockId);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, blockIds: [] };
    colorGroups[color_key].blockIds.push(blockId);
  }
  return Object.values(colorGroups).map(async ({ color, blockIds }) => {
    const result = await modelColorStyle.setModelBlocksColor(modelId, blockIds, color, "constant");
    return result;
  });
}

function groupModelBlocksVertexAttributes(
  modelId: ModelId,
  typeBlocksIds: BlockId[],
  modelBlocksVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const blockId of typeBlocksIds) {
    const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, blockId);
    const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
      modelId,
      blockId,
    );
    const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
      modelId,
      blockId,
    );
    const no_data_color = modelBlocksVertexAttribute.modelBlocksVertexAttributeNoDataColor(
      modelId,
      blockId,
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
      vertexGroups[key] = { ...attribute, blockIds: [blockId] };
    } else {
      group.blockIds.push(blockId);
    }
  }
  return vertexGroups;
}

function applyModelBlocksVertexColoring(
  modelId: ModelId,
  typeBlocksIds: BlockId[],
  modelBlocksVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelBlocksVertexAttributes(
    modelId,
    typeBlocksIds,
    modelBlocksVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, blockIds }) => {
      const result = await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(
        modelId,
        blockIds,
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

function groupModelBlocksPolyhedronAttributes(
  modelId: ModelId,
  typeBlocksIds: BlockId[],
  modelBlocksPolyhedronAttribute: PolyhedronAttributeStyle,
): Record<string, AttributeGroup> {
  const polyhedronGroups: Record<string, AttributeGroup> = {};
  for (const blockId of typeBlocksIds) {
    const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
      modelId,
      blockId,
    );
    const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
      modelId,
      blockId,
    );
    const [minimum, maximum] = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(
      modelId,
      blockId,
    );
    const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
      modelId,
      blockId,
    );
    const no_data_color = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      blockId,
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
    const group = polyhedronGroups[key];
    if (group === undefined) {
      polyhedronGroups[key] = { ...attribute, blockIds: [blockId] };
    } else {
      group.blockIds.push(blockId);
    }
  }
  return polyhedronGroups;
}

function applyModelBlocksPolyhedronColoring(
  modelId: ModelId,
  typeBlocksIds: BlockId[],
  modelBlocksPolyhedronAttribute: PolyhedronAttributeStyle,
): Promise<unknown>[] {
  const polyhedronGroups = groupModelBlocksPolyhedronAttributes(
    modelId,
    typeBlocksIds,
    modelBlocksPolyhedronAttribute,
  );
  return Object.values(polyhedronGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, blockIds }) => {
      const result = await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
        modelId,
        blockIds,
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
