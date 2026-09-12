import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex.attribute;

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: unknown;
}

interface AttributeState {
  name?: string;
  item?: number;
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

interface AttributeInput {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color?: unknown;
}

function isModelCornersVertexAttributeValid({
  name,
  item,
  minimum,
  maximum,
  colorMap,
}: AttributeInput): boolean {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelCornersVertexAttribute() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const viewerStore = useViewerStore();
  function modelCornersVertexAttribute(modelId: string, cornerId?: string): AttributeState {
    return modelCornersCommonStyle.modelCornerColoring(modelId, cornerId).vertex as AttributeState;
  }
  function modelCornersVertexAttributeStoredConfig(
    modelId: string,
    cornerId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (
      storedConfigs &&
      name !== undefined &&
      name in storedConfigs &&
      item !== undefined &&
      item in storedConfigs[name]!
    ) {
      return storedConfigs[name]![item]!;
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  function mutateModelCornersVertexStyle(
    modelId: string,
    cornerIds: string[],
    values: Record<string, unknown>,
  ) {
    if (cornerIds.length > 1) {
      modelCornersCommonStyle.mutateModelCornersTypeColoring(modelId, {
        vertex: values,
      });
    }
    return modelCornersCommonStyle.mutateModelCornersColoring(modelId, cornerIds, {
      vertex: values,
    });
  }
  function setModelCornersVertexAttributeStoredConfig(
    modelId: string,
    cornerIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateModelCornersVertexStyle(modelId, cornerIds, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function modelCornersVertexAttributeName(modelId: string, cornerId?: string): string | undefined {
    return modelCornersVertexAttribute(modelId, cornerId).name;
  }
  function modelCornersVertexAttributeLastItem(
    modelId: string,
    cornerId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function modelCornersVertexAttributeItem(modelId: string, cornerId?: string): number {
    const vertexAttribute = modelCornersVertexAttribute(modelId, cornerId);
    return (
      vertexAttribute.item ??
      modelCornersVertexAttributeLastItem(modelId, cornerId, vertexAttribute.name)
    );
  }
  function modelCornersVertexAttributeRange(
    modelId: string,
    cornerId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelCornersVertexAttributeColorMap(modelId: string, cornerId?: string): string | undefined {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelCornersVertexAttribute(
    modelId: string,
    cornerIds: string[],
    { name, item, minimum, maximum, colorMap, no_data_color = DEFAULT_NO_DATA_COLOR }: AttributeInput,
  ) {
    mutateModelCornersVertexStyle(modelId, cornerIds, {
      name,
      item,
    });
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = {
      id: modelId,
      block_ids: corner_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema: attributeSchema,
      params,
    });
  }
  function applyVertexAttribute(modelId: string, cornerIds: string[]) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelCornersVertexAttributeValid(attribute)) {
      return setModelCornersVertexAttribute(modelId, cornerIds, attribute);
    }
    return Promise.resolve();
  }
  function setModelCornersVertexAttributeName(modelId: string, cornerIds: string[], name: string) {
    const item = modelCornersVertexAttributeLastItem(modelId, cornerIds[0], name);
    mutateModelCornersVertexStyle(modelId, cornerIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }
  function setModelCornersVertexAttributeItem(modelId: string, cornerIds: string[], item: number) {
    mutateModelCornersVertexStyle(modelId, cornerIds, {
      item,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }
  function setModelCornersVertexAttributeRange(
    modelId: string,
    cornerIds: string[],
    minimum: number,
    maximum: number,
  ) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }
  function setModelCornersVertexAttributeColorMap(
    modelId: string,
    cornerIds: string[],
    colorMap: string | undefined,
  ) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }
  function modelCornersVertexAttributeNoDataColor(modelId: string, cornerId?: string): unknown {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelCornersVertexAttributeNoDataColor(
    modelId: string,
    cornerIds: string[],
    no_data_color: unknown,
  ) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }
  return {
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeItem,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeStoredConfig,
    setModelCornersVertexAttribute,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeItem,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeNoDataColor,
    setModelCornersVertexAttributeNoDataColor,
  };
}
export { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute };
