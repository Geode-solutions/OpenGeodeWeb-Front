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

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksPolyhedronAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();
  function modelBlocksPolyhedronAttribute(modelId: string, blockId?: string): AttributeState {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron as AttributeState;
  }
  function modelBlocksPolyhedronAttributeStoredConfig(
    modelId: string,
    blockId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
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
  function mutateModelBlocksPolyhedronStyle(
    modelId: string,
    blockIds: string[],
    values: Record<string, unknown>,
  ) {
    if (blockIds.length > 1) {
      modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
        polyhedron: values,
      });
    }
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      polyhedron: values,
    });
  }
  function setModelBlocksPolyhedronAttributeStoredConfig(
    modelId: string,
    blockIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
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
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
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
  ) {
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      name,
      item,
    });
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
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
  function applyPolyhedronAttribute(modelId: string, blockIds: string[]) {
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
      return setModelBlocksPolyhedronAttribute(modelId, blockIds, attribute);
    }
    return Promise.resolve();
  }
  function setModelBlocksPolyhedronAttributeName(
    modelId: string,
    blockIds: string[],
    name: string,
  ) {
    const item = modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      name,
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  function setModelBlocksPolyhedronAttributeItem(
    modelId: string,
    blockIds: string[],
    item: number,
  ) {
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  function setModelBlocksPolyhedronAttributeRange(
    modelId: string,
    blockIds: string[],
    minimum: number,
    maximum: number,
  ) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  function setModelBlocksPolyhedronAttributeColorMap(
    modelId: string,
    blockIds: string[],
    colorMap: string | undefined,
  ) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
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
  ) {
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
