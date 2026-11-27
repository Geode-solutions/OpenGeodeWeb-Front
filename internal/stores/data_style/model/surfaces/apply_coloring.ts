import type { AttributeGroup, ColorGroup } from "./coloring_groups";
import type { ModelId, SurfaceId } from "@ogw_front/types/identifiers";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import type { useModelSurfacesColor } from "./color";
import type { useModelSurfacesPolygonAttribute } from "./polygon";
import type { useModelSurfacesVertexAttribute } from "./vertex";

type ColorStyle = ReturnType<typeof useModelSurfacesColor>;
type VertexAttributeStyle = ReturnType<typeof useModelSurfacesVertexAttribute>;
type PolygonAttributeStyle = ReturnType<typeof useModelSurfacesPolygonAttribute>;

function applyModelSurfacesConstantColoring(
  modelId: ModelId,
  typeSurfacesIds: SurfaceId[],
  modelColorStyle: ColorStyle,
): Promise<unknown>[] {
  const colorGroups: Record<string, ColorGroup> = {};
  for (const surfaceId of typeSurfacesIds) {
    const color = modelColorStyle.modelSurfaceColor(modelId, surfaceId);
    const color_key = JSON.stringify(color);
    colorGroups[color_key] ??= { color, surfaceIds: [] };
    colorGroups[color_key].surfaceIds.push(surfaceId);
  }
  return Object.values(colorGroups).map(async ({ color, surfaceIds }) => {
    const result = await modelColorStyle.setModelSurfacesColor(
      modelId,
      surfaceIds,
      color,
      "constant",
    );
    return result;
  });
}

function groupModelSurfacesVertexAttributes(
  modelId: ModelId,
  typeSurfacesIds: SurfaceId[],
  modelSurfacesVertexAttribute: VertexAttributeStyle,
): Record<string, AttributeGroup> {
  const vertexGroups: Record<string, AttributeGroup> = {};
  for (const surfaceId of typeSurfacesIds) {
    const name = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const [minimum, maximum] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
      modelId,
      surfaceId,
    );
    const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
      modelId,
      surfaceId,
    );
    const no_data_color = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeNoDataColor(
      modelId,
      surfaceId,
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
      vertexGroups[key] = { ...attribute, surfaceIds: [surfaceId] };
    } else {
      group.surfaceIds.push(surfaceId);
    }
  }
  return vertexGroups;
}

function applyModelSurfacesVertexColoring(
  modelId: ModelId,
  typeSurfacesIds: SurfaceId[],
  modelSurfacesVertexAttribute: VertexAttributeStyle,
): Promise<unknown>[] {
  const vertexGroups = groupModelSurfacesVertexAttributes(
    modelId,
    typeSurfacesIds,
    modelSurfacesVertexAttribute,
  );
  return Object.values(vertexGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, surfaceIds }) => {
      const result = await modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(
        modelId,
        surfaceIds,
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
  modelId: ModelId,
  typeSurfacesIds: SurfaceId[],
  modelSurfacesPolygonAttribute: PolygonAttributeStyle,
): Record<string, AttributeGroup> {
  const polygonGroups: Record<string, AttributeGroup> = {};
  for (const surfaceId of typeSurfacesIds) {
    const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
      modelId,
      surfaceId,
    );
    const item = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeItem(
      modelId,
      surfaceId,
    );
    const [minimum, maximum] = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(
      modelId,
      surfaceId,
    );
    const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
      modelId,
      surfaceId,
    );
    const no_data_color = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeNoDataColor(
      modelId,
      surfaceId,
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
    const group = polygonGroups[key];
    if (group === undefined) {
      polygonGroups[key] = { ...attribute, surfaceIds: [surfaceId] };
    } else {
      group.surfaceIds.push(surfaceId);
    }
  }
  return polygonGroups;
}

function applyModelSurfacesPolygonColoring(
  modelId: ModelId,
  typeSurfacesIds: SurfaceId[],
  modelSurfacesPolygonAttribute: PolygonAttributeStyle,
): Promise<unknown>[] {
  const polygonGroups = groupModelSurfacesPolygonAttributes(
    modelId,
    typeSurfacesIds,
    modelSurfacesPolygonAttribute,
  );
  return Object.values(polygonGroups).map(
    async ({ name, item, minimum, maximum, colorMap, no_data_color, surfaceIds }) => {
      const result = await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
        modelId,
        surfaceIds,
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
