import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { DataId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelSurfacesColor } from "./color";
import type { useModelSurfacesPolygonAttribute } from "./polygon";
import type { useModelSurfacesVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelSurfacesColor>;
type VertexAttributeStyle = ReturnType<typeof useModelSurfacesVertexAttribute>;
type PolygonAttributeStyle = ReturnType<typeof useModelSurfacesPolygonAttribute>;

function applyModelSurfacesConstantColoring(
  modelId: DataId,
  type_surfaces_ids: string[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const surfaces_id of type_surfaces_ids) {
    const color = modelColorStyle.modelSurfaceColor(modelId, surfaces_id);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, surfaces_ids: [] };
    colorGroups[color_key].surfaces_ids.push(surfaces_id);
  }
  return Object.values(colorGroups).map(async ({ color, surfaces_ids: ids }) => {
    const result = await modelColorStyle.setModelSurfacesColor(modelId, ids, color, "constant");
    return result;
  });
}

function groupModelSurfacesVertexAttributes(
  modelId: DataId,
  type_surfaces_ids: string[],
  modelSurfacesVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const surfaces_id of type_surfaces_ids) {
    const name = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeName(
      modelId,
      surfaces_id,
    );
    const item = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeItem(
      modelId,
      surfaces_id,
    );
    const [minimum, maximum] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
      modelId,
      surfaces_id,
    );
    const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
      modelId,
      surfaces_id,
    );
    const no_data_color = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeNoDataColor(
      modelId,
      surfaces_id,
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
    vertexGroups[key] ??= { ...attribute, surfaces_ids: [] };
    vertexGroups[key].surfaces_ids.push(surfaces_id);
  }
  return vertexGroups;
}

function applyModelSurfacesVertexColoring(
  modelId: DataId,
  type_surfaces_ids: string[],
  modelSurfacesVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelSurfacesVertexAttributes(
    modelId,
    type_surfaces_ids,
    modelSurfacesVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, surfaces_ids: ids }) => {
      const result = await modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(
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

function groupModelSurfacesPolygonAttributes(
  modelId: DataId,
  type_surfaces_ids: string[],
  modelSurfacesPolygonAttribute: PolygonAttributeStyle,
): Record<string, AttributeGroup> {
  const polygonGroups: Record<string, AttributeGroup> = {};
  for (const surfaces_id of type_surfaces_ids) {
    const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
      modelId,
      surfaces_id,
    );
    const item = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeItem(
      modelId,
      surfaces_id,
    );
    const [minimum, maximum] = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(
      modelId,
      surfaces_id,
    );
    const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
      modelId,
      surfaces_id,
    );
    const no_data_color = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeNoDataColor(
      modelId,
      surfaces_id,
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
    polygonGroups[key] ??= { ...attribute, surfaces_ids: [] };
    polygonGroups[key].surfaces_ids.push(surfaces_id);
  }
  return polygonGroups;
}

function applyModelSurfacesPolygonColoring(
  modelId: DataId,
  type_surfaces_ids: string[],
  modelSurfacesPolygonAttribute: PolygonAttributeStyle,
): Promise<unknown>[] {
  const polygonGroups = groupModelSurfacesPolygonAttributes(
    modelId,
    type_surfaces_ids,
    modelSurfacesPolygonAttribute,
  );
  return Object.values(polygonGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, surfaces_ids: ids }) => {
      const result = await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
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
  applyModelSurfacesConstantColoring,
  applyModelSurfacesVertexColoring,
  applyModelSurfacesPolygonColoring,
};
