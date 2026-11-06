// oxlint-disable eslint/max-lines
import type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
  AttributeRange,
} from "@ogw_front/types/attribute";
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { LineId, ModelId } from "@ogw_front/types/identifiers";
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
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge.attribute;

interface UseModelLinesEdgeAttributeReturn {
  modelLinesEdgeAttributeName: (modelId: ModelId, lineId?: LineId) => AttributeName | undefined;
  modelLinesEdgeAttributeItem: (modelId: ModelId, lineId?: LineId) => AttributeItem;
  modelLinesEdgeAttributeRange: (modelId: ModelId, lineId?: LineId) => AttributeRange;
  modelLinesEdgeAttributeTimeStep: (modelId: ModelId, lineId?: LineId) => number | undefined;
  setModelLinesEdgeAttributeTimeStep: (
    modelId: ModelId,
    lineIds: LineId[],
    timeStep: number,
  ) => Promise<void>;
  modelLinesEdgeAttributeColorMap: (
    modelId: ModelId,
    lineId?: LineId,
  ) => AttributeColorMap | undefined;
  modelLinesEdgeAttributeStoredConfig: (
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setModelLinesEdgeAttribute: (
    modelId: ModelId,
    lineIds: LineId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeName: (
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeItem: (
    modelId: ModelId,
    lineIds: LineId[],
    item: AttributeItem,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeRange: (
    modelId: ModelId,
    lineIds: LineId[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeColorMap: (
    modelId: ModelId,
    lineIds: LineId[],
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  modelLinesEdgeAttributeNoDataColor: (modelId: ModelId, lineId?: LineId) => RGBAColor;
  setModelLinesEdgeAttributeNoDataColor: (
    modelId: ModelId,
    lineIds: LineId[],
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}

type ModelLinesEdgeAttributeGetters = Pick<
  UseModelLinesEdgeAttributeReturn,
  | "modelLinesEdgeAttributeStoredConfig"
  | "modelLinesEdgeAttributeName"
  | "modelLinesEdgeAttributeItem"
  | "modelLinesEdgeAttributeRange"
  | "modelLinesEdgeAttributeColorMap"
  | "modelLinesEdgeAttributeNoDataColor"
  | "modelLinesEdgeAttributeTimeStep"
> & {
  modelLinesEdgeAttributeLastItem: (
    modelId: ModelId,
    componentId: string | undefined,
    name: AttributeName | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelLinesEdgeAttributeGetters(
  modelLinesCommonStyle: ReturnType<typeof useModelLinesCommonStyle>,
): ModelLinesEdgeAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelLinesEdgeAttribute(modelId: ModelId, lineId?: LineId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.edge shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge as AttributeState;
  }
  function modelLinesEdgeAttributeStoredConfig(
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelLinesEdgeAttributeName(
    modelId: ModelId,
    lineId?: LineId,
  ): AttributeName | undefined {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }
  function modelLinesEdgeAttributeLastItem(
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelLinesEdgeAttributeItem(modelId: ModelId, lineId?: LineId): AttributeItem {
    const edgeAttribute = modelLinesEdgeAttribute(modelId, lineId);
    return (
      edgeAttribute.item ?? modelLinesEdgeAttributeLastItem(modelId, lineId, edgeAttribute.name)
    );
  }
  function modelLinesEdgeAttributeRange(modelId: ModelId, lineId?: LineId): AttributeRange {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelLinesEdgeAttributeColorMap(
    modelId: ModelId,
    lineId?: LineId,
  ): AttributeColorMap | undefined {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }
  function modelLinesEdgeAttributeNoDataColor(modelId: ModelId, lineId?: LineId): RGBAColor {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.no_data_color;
  }
  function modelLinesEdgeAttributeTimeStep(modelId: ModelId, lineId?: LineId): number | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelLinesEdgeAttribute(modelId, lineId).name,
    );
  }
  return {
    modelLinesEdgeAttributeStoredConfig,
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeLastItem,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeNoDataColor,
    modelLinesEdgeAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelLinesEdgeAttribute(): UseModelLinesEdgeAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const {
    modelLinesEdgeAttributeStoredConfig,
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeLastItem,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeNoDataColor,
    modelLinesEdgeAttributeTimeStep,
  } = useModelLinesEdgeAttributeGetters(modelLinesCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelLinesEdgeStyle(
    modelId: ModelId,
    lineIds: LineId[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
        edge: values,
      }),
    ];
    const totalLineIds = await dataStore.getLinesGeodeIds(modelId);
    if (lineIds.length === totalLineIds.length) {
      tasks.push(
        modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
          edge: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelLinesEdgeAttributeStoredConfig(
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  async function setModelLinesEdgeAttribute(
    modelId: ModelId,
    lineIds: LineId[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = {
      id: modelId,
      block_ids: line_viewer_ids,
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
  async function applyEdgeAttribute(modelId: ModelId, lineIds: LineId[]): Promise<void> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      await setModelLinesEdgeAttribute(modelId, lineIds, attribute);
    }
  }
  async function setModelLinesEdgeAttributeName(
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName,
  ): Promise<unknown> {
    const item = modelLinesEdgeAttributeLastItem(modelId, lineIds[0], name);
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeItem(
    modelId: ModelId,
    lineIds: LineId[],
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeTimeStep(
    modelId: ModelId,
    lineIds: LineId[],
    timeStep: number,
  ): Promise<void> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyEdgeAttribute(modelId, lineIds),
      reapplySameSeries(
        await dataStore.getLinesGeodeIds(modelId),
        lineIds,
        (id) => {
          if (
            modelLinesCommonStyle.modelLineColoring(modelId, id).active === "edge" &&
            modelLinesEdgeAttributeName(modelId, id) === name
          ) {
            return [
              modelLinesEdgeAttributeItem(modelId, id),
              modelLinesEdgeAttributeRange(modelId, id),
              modelLinesEdgeAttributeColorMap(modelId, id),
              JSON.stringify(modelLinesEdgeAttributeNoDataColor(modelId, id)),
            ].join("|");
          }
          return undefined;
        },
        async (ids) => {
          await applyEdgeAttribute(modelId, ids);
        },
      ),
    ]);
  }
  async function setModelLinesEdgeAttributeRange(
    modelId: ModelId,
    lineIds: LineId[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeColorMap(
    modelId: ModelId,
    lineIds: LineId[],
    colorMap: AttributeColorMap | undefined,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeNoDataColor(
    modelId: ModelId,
    lineIds: LineId[],
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeTimeStep,
    setModelLinesEdgeAttributeTimeStep,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttribute,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeItem,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeNoDataColor,
    setModelLinesEdgeAttributeNoDataColor,
  };
}
export { useModelLinesEdgeAttribute };
