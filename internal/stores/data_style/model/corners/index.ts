import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibility } from "./visibility";

interface ColorGroup {
  color: RGBAColor | undefined;
  corners_ids: string[];
}

interface AttributeGroup {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
  corners_ids: string[];
}

async function setModelCornersDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

type ModelCornersStyleApi = ReturnType<typeof useModelCornersCommonStyle> &
  ReturnType<typeof useModelCornersVisibility> &
  ReturnType<typeof useModelCornersColor> &
  ReturnType<typeof useModelCornersVertexAttribute> & {
    applyModelCornersStyle: (modelId: DataId) => Promise<void>;
    setModelCornersDefaultStyle: (modelId: DataId) => Promise<void>;
  };

export function useModelCornersStyle(): ModelCornersStyleApi {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCornersCommonStyle();
  const modelVisibilityStyle = useModelCornersVisibility();
  const modelColorStyle = useModelCornersColor();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  async function applyModelCornersVisibilityStyle(
    modelId: DataId,
    corners_ids: string[],
  ): Promise<unknown[]> {
    const visibilityGroups: Record<string, string[]> = {};
    for (const corner_id of corners_ids) {
      const style = modelCommonStyle.modelCornerStyle(modelId, corner_id);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(corner_id);
    }
    const results = await Promise.all(
      Object.entries(visibilityGroups).map(async ([visibility, ids]) => {
        const result = await modelVisibilityStyle.setModelCornersVisibility(
          modelId,
          ids,
          visibility === "true",
        );
        return result;
      }),
    );
    return results;
  }

  function groupCornersByActiveColoring(
    modelId: DataId,
    corners_ids: string[],
  ): Record<string, string[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const corner_id of corners_ids) {
      const activeColoring = String(modelColorStyle.modelCornerActiveColoring(modelId, corner_id));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(corner_id);
    }
    return activeColoringGroups;
  }

  function applyConstantColoring(modelId: DataId, corners_ids: string[]): Promise<unknown>[] {
    const colorGroups: Record<string, ColorGroup> = {};
    for (const corner_id of corners_ids) {
      const color = modelColorStyle.modelCornerColor(modelId, corner_id);
      const color_key = JSON.stringify(color);
      colorGroups[color_key] ??= { color, corners_ids: [] };
      colorGroups[color_key].corners_ids.push(corner_id);
    }
    return Object.values(colorGroups).map(async ({ color, corners_ids: ids }) => {
      const result = await modelColorStyle.setModelCornersColor(modelId, ids, color, "constant");
      return result;
    });
  }

  function groupCornersByVertexAttribute(
    modelId: DataId,
    corners_ids: string[],
  ): Record<string, AttributeGroup> {
    const vertexGroups: Record<string, AttributeGroup> = {};
    for (const corner_id of corners_ids) {
      const name = modelCornersVertexAttribute.modelCornersVertexAttributeName(modelId, corner_id);
      const item = modelCornersVertexAttribute.modelCornersVertexAttributeItem(modelId, corner_id);
      const [minimum, maximum] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
        modelId,
        corner_id,
      );
      const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
        modelId,
        corner_id,
      );
      const no_data_color = modelCornersVertexAttribute.modelCornersVertexAttributeNoDataColor(
        modelId,
        corner_id,
      );
      const attribute = {
        name,
        item,
        minimum,
        maximum,
        colorMap,
        no_data_color,
      };
      if (!isModelCornersVertexAttributeValid(attribute)) {
        continue;
      }
      const key = [name, item, colorMap, minimum, maximum, JSON.stringify(no_data_color)].join("_");
      vertexGroups[key] ??= { ...attribute, corners_ids: [] };
      vertexGroups[key].corners_ids.push(corner_id);
    }
    return vertexGroups;
  }

  function applyVertexColoring(modelId: DataId, corners_ids: string[]): Promise<unknown>[] {
    const vertexGroups = groupCornersByVertexAttribute(modelId, corners_ids);
    return Object.values(vertexGroups).map(
      async ({ name, item, minimum, maximum, colorMap, no_data_color, corners_ids: ids }) => {
        const result = await modelCornersVertexAttribute.setModelCornersVertexAttribute(
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

  async function applyModelCornersColoringStyle(
    modelId: DataId,
    corners_ids: string[],
  ): Promise<unknown[]> {
    const activeColoringGroups = groupCornersByActiveColoring(modelId, corners_ids);

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_corners_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        coloringPromises.push(...applyConstantColoring(modelId, type_corners_ids));
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelCornersColor(modelId, type_corners_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        coloringPromises.push(...applyVertexColoring(modelId, type_corners_ids));
      }
    }

    const results = await Promise.all(coloringPromises);
    return results;
  }

  async function applyModelCornersStyle(modelId: DataId): Promise<void> {
    const corners_ids = await dataStore.getCornersGeodeIds(modelId);
    if (corners_ids.length === 0) {
      return;
    }

    await Promise.all([
      applyModelCornersVisibilityStyle(modelId, corners_ids),
      applyModelCornersColoringStyle(modelId, corners_ids),
    ]);
  }

  return {
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelCornersVertexAttribute,
  };
}
