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
const modelBlockPolyhedronAttributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron.attribute;

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

function isModelBlocksPolyhedronAttributeValid({
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

interface UseModelBlocksPolyhedronAttributeReturn {
  modelBlocksPolyhedronAttributeName: (modelId: string, blockId?: string) => string | undefined;
  modelBlocksPolyhedronAttributeItem: (modelId: string, blockId?: string) => number;
  modelBlocksPolyhedronAttributeRange: (
    modelId: string,
    blockId?: string,
  ) => [number | undefined, number | undefined];
  modelBlocksPolyhedronAttributeColorMap: (modelId: string, blockId?: string) => string | undefined;
  modelBlocksPolyhedronAttributeStoredConfig: (
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelBlocksPolyhedronAttribute: (
    modelId: string,
    blockIds: string[],
    input: AttributeInput,
  ) => Promise<unknown>;
  setModelBlocksPolyhedronAttributeName: (
    modelId: string,
    blockIds: string[],
    name: string,
  ) => Promise<unknown>;
  setModelBlocksPolyhedronAttributeItem: (
    modelId: string,
    blockIds: string[],
    item: number,
  ) => Promise<unknown>;
  setModelBlocksPolyhedronAttributeRange: (
    modelId: string,
    blockIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelBlocksPolyhedronAttributeColorMap: (
    modelId: string,
    blockIds: string[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelBlocksPolyhedronAttributeNoDataColor: (modelId: string, blockId?: string) => unknown;
  setModelBlocksPolyhedronAttributeNoDataColor: (
    modelId: string,
    blockIds: string[],
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksPolyhedronAttribute(): UseModelBlocksPolyhedronAttributeReturn {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();
  function modelBlocksPolyhedronAttribute(modelId: string, blockId?: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polyhedron shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron as AttributeState;
  }
  function modelBlocksPolyhedronAttributeStoredConfig(
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
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
  async function mutateModelBlocksPolyhedronStyle(
    modelId: string,
    blockIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    if (blockIds.length > 1) {
      await modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
        polyhedron: values,
      });
    }
    await modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      polyhedron: values,
    });
  }
  async function setModelBlocksPolyhedronAttributeStoredConfig(
    modelId: string,
    blockIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  function modelBlocksPolyhedronAttributeName(
    modelId: string,
    blockId?: string,
  ): string | undefined {
    return modelBlocksPolyhedronAttribute(modelId, blockId).name;
  }
  function modelBlocksPolyhedronAttributeLastItem(
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelBlocksPolyhedronAttributeItem(modelId: string, blockId?: string): number {
    const polyhedronAttribute = modelBlocksPolyhedronAttribute(modelId, blockId);
    return (
      polyhedronAttribute.item ??
      modelBlocksPolyhedronAttributeLastItem(modelId, blockId, polyhedronAttribute.name)
    );
  }
  function modelBlocksPolyhedronAttributeRange(
    modelId: string,
    blockId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelBlocksPolyhedronAttributeColorMap(
    modelId: string,
    blockId?: string,
  ): string | undefined {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelBlocksPolyhedronAttribute(
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
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      name,
      item,
    });
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema: modelBlockPolyhedronAttributeSchema,
      params,
    });
  }
  async function applyPolyhedronAttribute(modelId: string, blockIds: string[]): Promise<unknown> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelBlocksPolyhedronAttributeValid(attribute)) {
      const result = await setModelBlocksPolyhedronAttribute(modelId, blockIds, attribute);
      return result;
    }
    return undefined;
  }
  async function setModelBlocksPolyhedronAttributeName(
    modelId: string,
    blockIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      name,
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeItem(
    modelId: string,
    blockIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeRange(
    modelId: string,
    blockIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeColorMap(
    modelId: string,
    blockIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      colorMap,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  function modelBlocksPolyhedronAttributeNoDataColor(modelId: string, blockId?: string): unknown {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelBlocksPolyhedronAttributeNoDataColor(
    modelId: string,
    blockIds: string[],
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  return {
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeItem,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeStoredConfig,
    setModelBlocksPolyhedronAttribute,
    setModelBlocksPolyhedronAttributeName,
    setModelBlocksPolyhedronAttributeItem,
    setModelBlocksPolyhedronAttributeRange,
    setModelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeNoDataColor,
    setModelBlocksPolyhedronAttributeNoDataColor,
  };
}
export { isModelBlocksPolyhedronAttributeValid, useModelBlocksPolyhedronAttribute };
