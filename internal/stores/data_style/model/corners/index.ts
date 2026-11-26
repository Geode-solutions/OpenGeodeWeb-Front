import type { CornerId, ModelId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVertexAttribute } from "./vertex";
import { useModelCornersVisibility } from "./visibility";

interface ColorGroup {
  color: ColorRGBA | undefined;
  cornerIds: CornerId[];
}

interface AttributeGroup extends ValidAttributeInput {
  cornerIds: NonEmptyArray<CornerId>;
}

async function setModelCornersDefaultStyle(_id: ModelId): Promise<void> {
  // Placeholder
}

type ModelCornersStyleApi = ReturnType<typeof useModelCornersCommonStyle> &
  ReturnType<typeof useModelCornersVisibility> &
  ReturnType<typeof useModelCornersColor> &
  ReturnType<typeof useModelCornersVertexAttribute> & {
    applyModelCornersStyle: (modelId: ModelId) => Promise<void>;
    setModelCornersDefaultStyle: (modelId: ModelId) => Promise<void>;
  };

export function useModelCornersStyle(): ModelCornersStyleApi {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCornersCommonStyle();
  const modelVisibilityStyle = useModelCornersVisibility();
  const modelColorStyle = useModelCornersColor();
  const modelCornersVertexAttribute = useModelCornersVertexAttribute();

  async function applyModelCornersVisibilityStyle(
    modelId: ModelId,
    cornerIds: CornerId[],
  ): Promise<unknown[]> {
    const visibilityGroups: Record<string, CornerId[]> = {};
    for (const cornerId of cornerIds) {
      const style = modelCommonStyle.modelCornerStyle(modelId, cornerId);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(cornerId);
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
    modelId: ModelId,
    cornerIds: CornerId[],
  ): Record<string, CornerId[]> {
    const activeColoringGroups: Record<string, CornerId[]> = {};
    for (const cornerId of cornerIds) {
      const activeColoring = String(modelColorStyle.modelCornerActiveColoring(modelId, cornerId));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(cornerId);
    }
    return activeColoringGroups;
  }

  function applyConstantColoring(modelId: ModelId, typeCornerIds: CornerId[]): Promise<unknown>[] {
    const colorGroups: Record<string, ColorGroup> = {};
    for (const cornerId of typeCornerIds) {
      const color = modelColorStyle.modelCornerColor(modelId, cornerId);
      const color_key = JSON.stringify(color);
      colorGroups[color_key] ??= { color, cornerIds: [] };
      colorGroups[color_key].cornerIds.push(cornerId);
    }
    return Object.values(colorGroups).map(async ({ color, cornerIds }) => {
      const result = await modelColorStyle.setModelCornersColor(
        modelId,
        cornerIds,
        color,
        "constant",
      );
      return result;
    });
  }

  function groupCornersByVertexAttribute(
    modelId: ModelId,
    cornerIds: CornerId[],
  ): Record<string, AttributeGroup> {
    const vertexGroups: Record<string, AttributeGroup> = {};
    for (const cornerId of cornerIds) {
      const name = modelCornersVertexAttribute.modelCornersVertexAttributeName(modelId, cornerId);
      const item = modelCornersVertexAttribute.modelCornersVertexAttributeItem(modelId, cornerId);
      const [minimum, maximum] = modelCornersVertexAttribute.modelCornersVertexAttributeRange(
        modelId,
        cornerId,
      );
      const colorMap = modelCornersVertexAttribute.modelCornersVertexAttributeColorMap(
        modelId,
        cornerId,
      );
      const no_data_color = modelCornersVertexAttribute.modelCornersVertexAttributeNoDataColor(
        modelId,
        cornerId,
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
        vertexGroups[key] = { ...attribute, cornerIds: [cornerId] };
      } else {
        group.cornerIds.push(cornerId);
      }
    }
    return vertexGroups;
  }

  function applyVertexColoring(modelId: ModelId, typeCornerIds: CornerId[]): Promise<unknown>[] {
    const vertexGroups = groupCornersByVertexAttribute(modelId, typeCornerIds);
    return Object.values(vertexGroups).map(
      async ({ name, item, minimum, maximum, colorMap, no_data_color, cornerIds }) => {
        const result = await modelCornersVertexAttribute.setModelCornersVertexAttribute(
          modelId,
          cornerIds,
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
    modelId: ModelId,
    cornerIds: CornerId[],
  ): Promise<unknown[]> {
    const activeColoringGroups = groupCornersByActiveColoring(modelId, cornerIds);

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, typeCornerIds] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        coloringPromises.push(...applyConstantColoring(modelId, typeCornerIds));
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelCornersColor(modelId, typeCornerIds, undefined, "random"),
        );
      } else if (type === "vertex") {
        coloringPromises.push(...applyVertexColoring(modelId, typeCornerIds));
      }
    }

    const results = await Promise.all(coloringPromises);
    return results;
  }

  async function applyModelCornersStyle(modelId: ModelId): Promise<void> {
    const cornerIds = await dataStore.getCornersGeodeIds(modelId);
    if (cornerIds.length === 0) {
      return;
    }

    await Promise.all([
      applyModelCornersVisibilityStyle(modelId, cornerIds),
      applyModelCornersColoringStyle(modelId, cornerIds),
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
