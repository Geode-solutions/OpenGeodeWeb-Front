// oxlint-disable eslint/max-lines
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex.attribute;

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

function isModelBlocksVertexAttributeValid({
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

interface UseModelBlocksVertexAttributeReturn {
  modelBlocksVertexAttributeName: (modelId: string, blockId?: string) => string | undefined;
  modelBlocksVertexAttributeItem: (modelId: string, blockId?: string) => number;
  modelBlocksVertexAttributeRange: (
    modelId: string,
    blockId?: string,
  ) => [number | undefined, number | undefined];
  modelBlocksVertexAttributeColorMap: (modelId: string, blockId?: string) => string | undefined;
  modelBlocksVertexAttributeStoredConfig: (
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelBlocksVertexAttribute: (
    modelId: string,
    blockIds: string[],
    input: AttributeInput,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeName: (
    modelId: string,
    blockIds: string[],
    name: string,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeItem: (
    modelId: string,
    blockIds: string[],
    item: number,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeRange: (
    modelId: string,
    blockIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeColorMap: (
    modelId: string,
    blockIds: string[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelBlocksVertexAttributeNoDataColor: (modelId: string, blockId?: string) => unknown;
  setModelBlocksVertexAttributeNoDataColor: (
    modelId: string,
    blockIds: string[],
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksVertexAttribute(): UseModelBlocksVertexAttributeReturn {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();
  function modelBlocksVertexAttribute(modelId: string, blockId?: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).vertex as AttributeState;
  }
  function modelBlocksVertexAttributeStoredConfig(
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
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
  async function mutateModelBlocksVertexStyle(
    modelId: string,
    blockIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
        vertex: values,
      }),
    ];
    if (blockIds.length > 1) {
      tasks.push(
        modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
          vertex: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelBlocksVertexAttributeStoredConfig(
    modelId: string,
    blockIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  function modelBlocksVertexAttributeName(modelId: string, blockId?: string): string | undefined {
    return modelBlocksVertexAttribute(modelId, blockId).name;
  }
  function modelBlocksVertexAttributeLastItem(
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelBlocksVertexAttributeItem(modelId: string, blockId?: string): number {
    const vertexAttribute = modelBlocksVertexAttribute(modelId, blockId);
    return (
      vertexAttribute.item ??
      modelBlocksVertexAttributeLastItem(modelId, blockId, vertexAttribute.name)
    );
  }
  function modelBlocksVertexAttributeRange(
    modelId: string,
    blockId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelBlocksVertexAttributeColorMap(
    modelId: string,
    blockId?: string,
  ): string | undefined {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelBlocksVertexAttribute(
    modelId: string,
    blockIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      name,
      item,
    });
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: block_viewer_ids,
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
  async function applyVertexAttribute(modelId: string, blockIds: string[]): Promise<unknown> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelBlocksVertexAttributeValid(attribute)) {
      const result = await setModelBlocksVertexAttribute(modelId, blockIds, attribute);
      return result;
    }
    return undefined;
  }
  async function setModelBlocksVertexAttributeName(
    modelId: string,
    blockIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelBlocksVertexAttributeLastItem(modelId, blockIds[0], name);
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeItem(
    modelId: string,
    blockIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      item,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeRange(
    modelId: string,
    blockIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeColorMap(
    modelId: string,
    blockIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  function modelBlocksVertexAttributeNoDataColor(modelId: string, blockId?: string): unknown {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelBlocksVertexAttributeNoDataColor(
    modelId: string,
    blockIds: string[],
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  return {
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeItem,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeStoredConfig,
    setModelBlocksVertexAttribute,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeItem,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeNoDataColor,
    setModelBlocksVertexAttributeNoDataColor,
  };
}
export { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute };
