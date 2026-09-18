import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex.attribute;

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

function isModelLinesVertexAttributeValid({
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

interface UseModelLinesVertexAttributeReturn {
  modelLinesVertexAttributeName: (modelId: string, lineId?: string) => string | undefined;
  modelLinesVertexAttributeItem: (modelId: string, lineId?: string) => number;
  modelLinesVertexAttributeRange: (modelId: string, lineId?: string) => [number | undefined, number | undefined];
  modelLinesVertexAttributeColorMap: (modelId: string, lineId?: string) => string | undefined;
  modelLinesVertexAttributeStoredConfig: (modelId: string, lineId: string | undefined, name: string | undefined, item: number | undefined) => AttributeStoredConfig;
  setModelLinesVertexAttribute: (modelId: string, lineIds: string[], input: AttributeInput) => Promise<unknown>;
  setModelLinesVertexAttributeName: (modelId: string, lineIds: string[], name: string) => Promise<unknown>;
  setModelLinesVertexAttributeItem: (modelId: string, lineIds: string[], item: number) => Promise<unknown>;
  setModelLinesVertexAttributeRange: (modelId: string, lineIds: string[], minimum: number, maximum: number) => Promise<unknown>;
  setModelLinesVertexAttributeColorMap: (modelId: string, lineIds: string[], colorMap: string | undefined) => Promise<unknown>;
  modelLinesVertexAttributeNoDataColor: (modelId: string, lineId?: string) => unknown;
  setModelLinesVertexAttributeNoDataColor: (modelId: string, lineIds: string[], no_data_color: unknown) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelLinesVertexAttribute(): UseModelLinesVertexAttributeReturn {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();
  function modelLinesVertexAttribute(modelId: string, lineId?: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).vertex as AttributeState;
  }
  function modelLinesVertexAttributeStoredConfig(
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  async function mutateModelLinesVertexStyle(
    modelId: string,
    lineIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    if (lineIds.length > 1) {
      await modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        vertex: values,
      });
    }
    await modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      vertex: values,
    });
  }
  async function setModelLinesVertexAttributeStoredConfig(
    modelId: string,
    lineIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  function modelLinesVertexAttributeName(modelId: string, lineId?: string): string | undefined {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }
  function modelLinesVertexAttributeLastItem(
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelLinesVertexAttributeItem(modelId: string, lineId?: string): number {
    const vertexAttribute = modelLinesVertexAttribute(modelId, lineId);
    return (
      vertexAttribute.item ??
      modelLinesVertexAttributeLastItem(modelId, lineId, vertexAttribute.name)
    );
  }
  function modelLinesVertexAttributeRange(
    modelId: string,
    lineId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelLinesVertexAttributeColorMap(modelId: string, lineId?: string): string | undefined {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelLinesVertexAttribute(
    modelId: string,
    lineIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      name,
      item,
    });
    await setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = {
      id: modelId,
      block_ids: line_viewer_ids,
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
  async function applyVertexAttribute(modelId: string, lineIds: string[]): Promise<void> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelLinesVertexAttributeValid(attribute)) {
      await setModelLinesVertexAttribute(modelId, lineIds, attribute);
    }
  }
  async function setModelLinesVertexAttributeName(
    modelId: string,
    lineIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelLinesVertexAttributeLastItem(modelId, lineIds[0], name);
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeItem(
    modelId: string,
    lineIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      item,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeRange(
    modelId: string,
    lineIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    await setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeColorMap(
    modelId: string,
    lineIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    await setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  function modelLinesVertexAttributeNoDataColor(modelId: string, lineId?: string): unknown {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelLinesVertexAttributeNoDataColor(
    modelId: string,
    lineIds: string[],
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    await setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  return {
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeItem,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeStoredConfig,
    setModelLinesVertexAttribute,
    setModelLinesVertexAttributeName,
    setModelLinesVertexAttributeItem,
    setModelLinesVertexAttributeRange,
    setModelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeNoDataColor,
    setModelLinesVertexAttributeNoDataColor,
  };
}
export { isModelLinesVertexAttributeValid, useModelLinesVertexAttribute };
