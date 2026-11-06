// oxlint-disable eslint/max-lines
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
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
const modelBlockPolyhedronAttributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron.attribute;

interface UseModelBlocksPolyhedronAttributeReturn {
  modelBlocksPolyhedronAttributeName: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => AttributeName | undefined;
  modelBlocksPolyhedronAttributeItem: (modelId: ModelId, blockId?: BlockId) => AttributeItem;
  modelBlocksPolyhedronAttributeRange: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => [number | undefined, number | undefined];
  modelBlocksPolyhedronAttributeTimeStep: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => number | undefined;
  setModelBlocksPolyhedronAttributeTimeStep: (
    modelId: ModelId,
    blockIds: BlockId[],
    timeStep: number,
  ) => Promise<boolean>;
  modelBlocksPolyhedronAttributeColorMap: (
    modelId: ModelId,
    blockId?: BlockId,
  ) => string | undefined;
  modelBlocksPolyhedronAttributeStoredConfig: (
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setModelBlocksPolyhedronAttribute: (
    modelId: ModelId,
    blockIds: BlockId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelBlocksPolyhedronAttributeName: (
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName,
  ) => Promise<boolean>;
  setModelBlocksPolyhedronAttributeItem: (
    modelId: ModelId,
    blockIds: BlockId[],
    item: AttributeItem,
  ) => Promise<boolean>;
  setModelBlocksPolyhedronAttributeRange: (
    modelId: ModelId,
    blockIds: BlockId[],
    minimum: number,
    maximum: number,
  ) => Promise<boolean>;
  setModelBlocksPolyhedronAttributeColorMap: (
    modelId: ModelId,
    blockIds: BlockId[],
    colorMap: string | undefined,
  ) => Promise<boolean>;
  modelBlocksPolyhedronAttributeNoDataColor: (modelId: ModelId, blockId?: BlockId) => RGBAColor;
  setModelBlocksPolyhedronAttributeNoDataColor: (
    modelId: ModelId,
    blockIds: BlockId[],
    no_data_color: RGBAColor,
  ) => Promise<boolean>;
}

type ModelBlocksPolyhedronAttributeGetters = Pick<
  UseModelBlocksPolyhedronAttributeReturn,
  | "modelBlocksPolyhedronAttributeStoredConfig"
  | "modelBlocksPolyhedronAttributeName"
  | "modelBlocksPolyhedronAttributeItem"
  | "modelBlocksPolyhedronAttributeRange"
  | "modelBlocksPolyhedronAttributeColorMap"
  | "modelBlocksPolyhedronAttributeNoDataColor"
  | "modelBlocksPolyhedronAttributeTimeStep"
> & {
  modelBlocksPolyhedronAttributeLastItem: (
    modelId: ModelId,
    componentId: string | undefined,
    name: AttributeName | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksPolyhedronAttributeGetters(
  modelBlocksCommonStyle: ReturnType<typeof useModelBlocksCommonStyle>,
): ModelBlocksPolyhedronAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelBlocksPolyhedronAttribute(modelId: ModelId, blockId?: BlockId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polyhedron shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron as AttributeState;
  }
  function modelBlocksPolyhedronAttributeStoredConfig(
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelBlocksPolyhedronAttributeName(
    modelId: ModelId,
    blockId?: BlockId,
  ): AttributeName | undefined {
    return modelBlocksPolyhedronAttribute(modelId, blockId).name;
  }
  function modelBlocksPolyhedronAttributeLastItem(
    modelId: ModelId,
    blockId: BlockId | undefined,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelBlocksPolyhedronAttributeItem(modelId: ModelId, blockId?: BlockId): AttributeItem {
    const polyhedronAttribute = modelBlocksPolyhedronAttribute(modelId, blockId);
    return (
      polyhedronAttribute.item ??
      modelBlocksPolyhedronAttributeLastItem(modelId, blockId, polyhedronAttribute.name)
    );
  }
  function modelBlocksPolyhedronAttributeRange(
    modelId: ModelId,
    blockId?: BlockId,
  ): [number | undefined, number | undefined] {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelBlocksPolyhedronAttributeColorMap(
    modelId: ModelId,
    blockId?: BlockId,
  ): string | undefined {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }
  function modelBlocksPolyhedronAttributeNoDataColor(
    modelId: ModelId,
    blockId?: BlockId,
  ): RGBAColor {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.no_data_color;
  }
  function modelBlocksPolyhedronAttributeTimeStep(
    modelId: ModelId,
    blockId?: BlockId,
  ): number | undefined {
    return attributeTimeStep(
      modelId,
      modelBlockPolyhedronAttributeSchema.$id,
      modelBlocksPolyhedronAttribute(modelId, blockId).name,
    );
  }
  return {
    modelBlocksPolyhedronAttributeStoredConfig,
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeLastItem,
    modelBlocksPolyhedronAttributeItem,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeNoDataColor,
    modelBlocksPolyhedronAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksPolyhedronAttribute(): UseModelBlocksPolyhedronAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const {
    modelBlocksPolyhedronAttributeStoredConfig,
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeLastItem,
    modelBlocksPolyhedronAttributeItem,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeNoDataColor,
    modelBlocksPolyhedronAttributeTimeStep,
  } = useModelBlocksPolyhedronAttributeGetters(modelBlocksCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelBlocksPolyhedronStyle(
    modelId: ModelId,
    blockIds: BlockId[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
        polyhedron: values,
      }),
    ];
    const totalBlockIds = await dataStore.getBlocksGeodeIds(modelId);
    if (blockIds.length === totalBlockIds.length) {
      tasks.push(
        modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
          polyhedron: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelBlocksPolyhedronAttributeStoredConfig(
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
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
  async function setModelBlocksPolyhedronAttribute(
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
    const points = [...getRGBPointsFromPreset(colorMap)];
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: viewer_ids,
      name: seriesArrayName(modelId, modelBlockPolyhedronAttributeSchema.$id, name),
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
  // True when the attribute was sent to the viewer, so the caller knows a render is needed
  async function applyPolyhedronAttribute(modelId: ModelId, blockIds: BlockId[]): Promise<boolean> {
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
    if (!isAttributeValid(attribute)) {
      return false;
    }
    await setModelBlocksPolyhedronAttribute(modelId, blockIds, attribute);
    return true;
  }
  async function setModelBlocksPolyhedronAttributeName(
    modelId: ModelId,
    blockIds: BlockId[],
    name: AttributeName,
  ): Promise<boolean> {
    const item = modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      name,
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeItem(
    modelId: ModelId,
    blockIds: BlockId[],
    item: AttributeItem,
  ): Promise<boolean> {
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      item,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeTimeStep(
    modelId: ModelId,
    blockIds: BlockId[],
    timeStep: number,
  ): Promise<boolean> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    if (name === undefined) {
      return false;
    }
    await setAttributeTimeStep(modelId, modelBlockPolyhedronAttributeSchema.$id, name, timeStep);
    let reapplied = false;
    const [applied] = await Promise.all([
      applyPolyhedronAttribute(modelId, blockIds),
      reapplySameSeries(
        await dataStore.getBlocksGeodeIds(modelId),
        blockIds,
        (id) => {
          if (
            modelBlocksCommonStyle.modelBlockColoring(modelId, id).active === "polyhedron" &&
            modelBlocksPolyhedronAttributeName(modelId, id) === name
          ) {
            return [
              modelBlocksPolyhedronAttributeItem(modelId, id),
              modelBlocksPolyhedronAttributeRange(modelId, id),
              modelBlocksPolyhedronAttributeColorMap(modelId, id),
              JSON.stringify(modelBlocksPolyhedronAttributeNoDataColor(modelId, id)),
            ].join("|");
          }
          return undefined;
        },
        async (ids) => {
          reapplied = (await applyPolyhedronAttribute(modelId, ids)) || reapplied;
        },
      ),
    ]);
    return applied || reapplied;
  }
  async function setModelBlocksPolyhedronAttributeRange(
    modelId: ModelId,
    blockIds: BlockId[],
    minimum: number,
    maximum: number,
  ): Promise<boolean> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeColorMap(
    modelId: ModelId,
    blockIds: BlockId[],
    colorMap: string | undefined,
  ): Promise<boolean> {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    await setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      colorMap,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }
  async function setModelBlocksPolyhedronAttributeNoDataColor(
    modelId: ModelId,
    blockIds: BlockId[],
    no_data_color: RGBAColor,
  ): Promise<boolean> {
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
    modelBlocksPolyhedronAttributeTimeStep,
    setModelBlocksPolyhedronAttributeTimeStep,
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
export { useModelBlocksPolyhedronAttribute };
