// oxlint-disable eslint/max-lines
import type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
  AttributeRange,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  AttributeTimeStep,
} from "@ogw_front/types/attribute";
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { BlockId, ModelId } from "@ogw_front/types/identifiers";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  reapplySameSeries,
  useAttributeTimeStepStyle,
} from "@ogw_internal/stores/data_style/time_step";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex.attribute;

interface UseModelBlocksVertexAttributeReturn {
  modelBlocksVertexAttributeName: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => AttributeName | undefined;
  modelBlocksVertexAttributeItem: (modelId: ModelId, blockId?: BlockId) => AttributeItem;
  modelBlocksVertexAttributeRange: (modelId: ModelId, blockId?: BlockId) => AttributeRange;
  modelBlocksVertexAttributeTimeStep: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => AttributeTimeStep | undefined;
  setModelBlocksVertexAttributeTimeStep: (
    modelId: ModelId,
    blockIds: BlockId[],
    timeStep: AttributeTimeStep,
  ) => Promise<void>;
  modelBlocksVertexAttributeColorMap: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => AttributeColorMap | undefined;
  modelBlocksVertexAttributeStoredConfig: (
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setModelBlocksVertexAttribute: (
    modelId: ModelId,
    blockIds: BlockId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeName: (
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeItem: (
    modelId: ModelId,
    blockIds: BlockId[],
    item: AttributeItem,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeRange: (
    modelId: ModelId,
    blockIds: BlockId[],
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setModelBlocksVertexAttributeColorMap: (
    modelId: ModelId,
    blockIds: BlockId[],
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  modelBlocksVertexAttributeNoDataColor: (modelId: ModelId, blockId?: BlockId) => RGBAColor;
  setModelBlocksVertexAttributeNoDataColor: (
    modelId: ModelId,
    blockIds: BlockId[],
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}

type ModelBlocksVertexAttributeGetters = Pick<
  UseModelBlocksVertexAttributeReturn,
  | "modelBlocksVertexAttributeStoredConfig"
  | "modelBlocksVertexAttributeName"
  | "modelBlocksVertexAttributeItem"
  | "modelBlocksVertexAttributeRange"
  | "modelBlocksVertexAttributeColorMap"
  | "modelBlocksVertexAttributeNoDataColor"
  | "modelBlocksVertexAttributeTimeStep"
> & {
  modelBlocksVertexAttributeLastItem: (
    modelId: ModelId,
    componentId: string | undefined,
    name: AttributeName | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksVertexAttributeGetters(
  modelBlocksCommonStyle: ReturnType<typeof useModelBlocksCommonStyle>,
): ModelBlocksVertexAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelBlocksVertexAttribute(modelId: ModelId, blockId?: BlockId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).vertex as AttributeState;
  }
  function modelBlocksVertexAttributeStoredConfig(
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelBlocksVertexAttributeName(
    modelId: ModelId,
    blockId?: BlockId,
  ): AttributeName | undefined {
    return modelBlocksVertexAttribute(modelId, blockId).name;
  }
  function modelBlocksVertexAttributeLastItem(
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelBlocksVertexAttributeItem(modelId: ModelId, blockId?: BlockId): AttributeItem {
    const vertexAttribute = modelBlocksVertexAttribute(modelId, blockId);
    return (
      vertexAttribute.item ??
      modelBlocksVertexAttributeLastItem(modelId, blockId, vertexAttribute.name)
    );
  }
  function modelBlocksVertexAttributeRange(modelId: ModelId, blockId?: BlockId): AttributeRange {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelBlocksVertexAttributeColorMap(
    modelId: ModelId,
    blockId?: BlockId,
  ): AttributeColorMap | undefined {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }
  function modelBlocksVertexAttributeNoDataColor(modelId: ModelId, blockId?: BlockId): RGBAColor {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.no_data_color;
  }
  function modelBlocksVertexAttributeTimeStep(
    modelId: ModelId,
    blockId?: BlockId,
  ): AttributeTimeStep | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelBlocksVertexAttribute(modelId, blockId).name,
    );
  }
  return {
    modelBlocksVertexAttributeStoredConfig,
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeLastItem,
    modelBlocksVertexAttributeItem,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeNoDataColor,
    modelBlocksVertexAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksVertexAttribute(): UseModelBlocksVertexAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const {
    modelBlocksVertexAttributeStoredConfig,
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeLastItem,
    modelBlocksVertexAttributeItem,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeNoDataColor,
    modelBlocksVertexAttributeTimeStep,
  } = useModelBlocksVertexAttributeGetters(modelBlocksCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelBlocksVertexStyle(
    modelId: ModelId,
    blockIds: BlockId[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
        vertex: values,
      }),
    ];
    const totalBlockIds = await dataStore.getBlocksGeodeIds(modelId);
    if (blockIds.length === totalBlockIds.length) {
      tasks.push(
        modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
          vertex: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelBlocksVertexAttributeStoredConfig(
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
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
  async function setModelBlocksVertexAttribute(
    modelId: ModelId,
    blockIds: BlockId[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
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
    const points = [...getRGBPointsFromPreset(colorMap)];
    const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: block_viewer_ids,
      name: seriesArrayName(modelId, attributeSchema.$id, name),
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
  async function applyVertexAttribute(modelId: ModelId, blockIds: BlockId[]): Promise<unknown> {
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
    if (isAttributeValid(attribute)) {
      const result = await setModelBlocksVertexAttribute(modelId, blockIds, attribute);
      return result;
    }
    return undefined;
  }
  async function setModelBlocksVertexAttributeName(
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName,
  ): Promise<unknown> {
    const item = modelBlocksVertexAttributeLastItem(modelId, blockIds[0], name);
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeItem(
    modelId: ModelId,
    blockIds: BlockId[],
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateModelBlocksVertexStyle(modelId, blockIds, {
      item,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeTimeStep(
    modelId: ModelId,
    blockIds: BlockId[],
    timeStep: AttributeTimeStep,
  ): Promise<void> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyVertexAttribute(modelId, blockIds),
      reapplySameSeries(
        await dataStore.getBlocksGeodeIds(modelId),
        blockIds,
        (id) => {
          if (
            modelBlocksCommonStyle.modelBlockColoring(modelId, id).active === "vertex" &&
            modelBlocksVertexAttributeName(modelId, id) === name
          ) {
            return [
              modelBlocksVertexAttributeItem(modelId, id),
              modelBlocksVertexAttributeRange(modelId, id),
              modelBlocksVertexAttributeColorMap(modelId, id),
              JSON.stringify(modelBlocksVertexAttributeNoDataColor(modelId, id)),
            ].join("|");
          }
          return undefined;
        },
        async (ids) => {
          await applyVertexAttribute(modelId, ids);
        },
      ),
    ]);
  }
  async function setModelBlocksVertexAttributeRange(
    modelId: ModelId,
    blockIds: BlockId[],
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
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
    modelId: ModelId,
    blockIds: BlockId[],
    colorMap: AttributeColorMap | undefined,
  ): Promise<unknown> {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, blockIds);
  }
  async function setModelBlocksVertexAttributeNoDataColor(
    modelId: ModelId,
    blockIds: BlockId[],
    no_data_color: RGBAColor,
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
    modelBlocksVertexAttributeTimeStep,
    setModelBlocksVertexAttributeTimeStep,
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
export { useModelBlocksVertexAttribute };
