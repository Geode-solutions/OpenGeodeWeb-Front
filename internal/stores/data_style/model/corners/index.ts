import { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute } from "./vertex";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibility } from "./visibility";

interface ColorGroup {
  color: unknown;
  corners_ids: string[];
}

interface AttributeGroup {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  corners_ids: string[];
}

async function setModelCornersDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

type ModelCornersStyleApi = ReturnType<typeof useModelCornersCommonStyle> &
  ReturnType<typeof useModelCornersVisibility> &
  ReturnType<typeof useModelCornersColor> &
  ReturnType<typeof useModelCornersVertexAttribute> & {
    applyModelCornersStyle: (modelId: string) => Promise<void>;
    setModelCornersDefaultStyle: (id: string) => Promise<void>;
  };

export function useModelCornersStyle(): ModelCornersStyleApi {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCornersCommonStyle();
  const modelVisibilityStyle = useModelCornersVisibility();
  const modelColorStyle = useModelCornersColor();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  async function applyModelCornersVisibilityStyle(
    modelId: string,
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
      Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
      ),
    );
    return results;
  }

  async function applyModelCornersColoringStyle(
    modelId: string,
    corners_ids: string[],
  ): Promise<unknown[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const corner_id of corners_ids) {
      const activeColoring = String(modelColorStyle.modelCornerActiveColoring(modelId, corner_id));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(corner_id);
    }

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_corners_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups: Record<string, ColorGroup> = {};
        for (const corner_id of type_corners_ids) {
          const color = modelColorStyle.modelCornerColor(modelId, corner_id);
          const color_key = JSON.stringify(color);
          colorGroups[color_key] ??= { color, corners_ids: [] };
          colorGroups[color_key].corners_ids.push(corner_id);
        }
        coloringPromises.push(
          ...Object.values(colorGroups).map(({ color, corners_ids: ids }) =>
            modelColorStyle.setModelCornersColor(modelId, ids, color, "constant"),
          ),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelCornersColor(modelId, type_corners_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups: Record<string, AttributeGroup> = {};
        for (const corner_id of type_corners_ids) {
          const name = modelCornersVertexAttribute.modelCornersVertexAttributeName(
            modelId,
            corner_id,
          );
          const item = modelCornersVertexAttribute.modelCornersVertexAttributeItem(
            modelId,
            corner_id,
          );
          const [minimum, maximum] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
            modelId,
            corner_id,
          );
          const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
            modelId,
            corner_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelCornersVertexAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          vertexGroups[key] ??= {
            name,
            item,
            minimum,
            maximum,
            colorMap,
            corners_ids: [],
          };
          vertexGroups[key].corners_ids.push(corner_id);
        }
        coloringPromises.push(
          ...Object.values(vertexGroups).map(
            ({ name, item, minimum, maximum, colorMap, corners_ids: ids }) =>
              modelCornersVertexAttribute.setModelCornersVertexAttribute(modelId, ids, {
                name,
                item,
                minimum,
                maximum,
                colorMap,
              }),
          ),
        );
      }
    }

    const results = await Promise.all(coloringPromises);
    return results;
  }

  async function applyModelCornersStyle(modelId: string): Promise<void> {
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
