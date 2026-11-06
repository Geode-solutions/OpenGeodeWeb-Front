// oxlint-disable eslint/max-lines
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
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
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex.attribute;

interface UseModelLinesVertexAttributeReturn {
  modelLinesVertexAttributeName: (modelId: ModelId, lineId?: LineId) => AttributeName | undefined;
  modelLinesVertexAttributeItem: (modelId: ModelId, lineId?: LineId) => AttributeItem;
  modelLinesVertexAttributeRange: (
    modelId: ModelId,
    lineId?: LineId,
  ) => [number | undefined, number | undefined];
  modelLinesVertexAttributeTimeStep: (modelId: ModelId, lineId?: LineId) => number | undefined;
  setModelLinesVertexAttributeTimeStep: (
    modelId: ModelId,
    lineIds: LineId[],
    timeStep: number,
  ) => Promise<void>;
  modelLinesVertexAttributeColorMap: (modelId: ModelId, lineId?: LineId) => string | undefined;
  modelLinesVertexAttributeStoredConfig: (
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setModelLinesVertexAttribute: (
    modelId: ModelId,
    lineIds: LineId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeName: (
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeItem: (
    modelId: ModelId,
    lineIds: LineId[],
    item: AttributeItem,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeRange: (
    modelId: ModelId,
    lineIds: LineId[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeColorMap: (
    modelId: ModelId,
    lineIds: LineId[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelLinesVertexAttributeNoDataColor: (modelId: ModelId, lineId?: LineId) => RGBAColor;
  setModelLinesVertexAttributeNoDataColor: (
    modelId: ModelId,
    lineIds: LineId[],
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}

type ModelLinesVertexAttributeGetters = Pick<
  UseModelLinesVertexAttributeReturn,
  | "modelLinesVertexAttributeStoredConfig"
  | "modelLinesVertexAttributeName"
  | "modelLinesVertexAttributeItem"
  | "modelLinesVertexAttributeRange"
  | "modelLinesVertexAttributeColorMap"
  | "modelLinesVertexAttributeNoDataColor"
  | "modelLinesVertexAttributeTimeStep"
> & {
  modelLinesVertexAttributeLastItem: (
    modelId: ModelId,
    componentId: string | undefined,
    name: AttributeName | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelLinesVertexAttributeGetters(
  modelLinesCommonStyle: ReturnType<typeof useModelLinesCommonStyle>,
): ModelLinesVertexAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelLinesVertexAttribute(modelId: ModelId, lineId?: LineId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).vertex as AttributeState;
  }
  function modelLinesVertexAttributeStoredConfig(
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelLinesVertexAttributeName(
    modelId: ModelId,
    lineId?: LineId,
  ): AttributeName | undefined {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }
  function modelLinesVertexAttributeLastItem(
    modelId: ModelId,
    lineId: LineId | undefined,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelLinesVertexAttributeItem(modelId: ModelId, lineId?: LineId): AttributeItem {
    const vertexAttribute = modelLinesVertexAttribute(modelId, lineId);
    return (
      vertexAttribute.item ??
      modelLinesVertexAttributeLastItem(modelId, lineId, vertexAttribute.name)
    );
  }
  function modelLinesVertexAttributeRange(
    modelId: ModelId,
    lineId?: LineId,
  ): [number | undefined, number | undefined] {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelLinesVertexAttributeColorMap(
    modelId: ModelId,
    lineId?: LineId,
  ): string | undefined {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }
  function modelLinesVertexAttributeNoDataColor(modelId: ModelId, lineId?: LineId): RGBAColor {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.no_data_color;
  }
  function modelLinesVertexAttributeTimeStep(
    modelId: ModelId,
    lineId?: LineId,
  ): number | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelLinesVertexAttribute(modelId, lineId).name,
    );
  }
  return {
    modelLinesVertexAttributeStoredConfig,
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeLastItem,
    modelLinesVertexAttributeItem,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeNoDataColor,
    modelLinesVertexAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelLinesVertexAttribute(): UseModelLinesVertexAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const {
    modelLinesVertexAttributeStoredConfig,
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeLastItem,
    modelLinesVertexAttributeItem,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeNoDataColor,
    modelLinesVertexAttributeTimeStep,
  } = useModelLinesVertexAttributeGetters(modelLinesCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelLinesVertexStyle(
    modelId: ModelId,
    lineIds: LineId[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
        vertex: values,
      }),
    ];
    const totalLineIds = await dataStore.getLinesGeodeIds(modelId);
    if (lineIds.length === totalLineIds.length) {
      tasks.push(
        modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
          vertex: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelLinesVertexAttributeStoredConfig(
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
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
  async function setModelLinesVertexAttribute(
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
  async function applyVertexAttribute(modelId: ModelId, lineIds: LineId[]): Promise<void> {
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
    if (isAttributeValid(attribute)) {
      await setModelLinesVertexAttribute(modelId, lineIds, attribute);
    }
  }
  async function setModelLinesVertexAttributeName(
    modelId: ModelId,
    lineIds: LineId[],
    name: AttributeName,
  ): Promise<unknown> {
    const item = modelLinesVertexAttributeLastItem(modelId, lineIds[0], name);
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeItem(
    modelId: ModelId,
    lineIds: LineId[],
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      item,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeTimeStep(
    modelId: ModelId,
    lineIds: LineId[],
    timeStep: number,
  ): Promise<void> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyVertexAttribute(modelId, lineIds),
      reapplySameSeries(
        await dataStore.getLinesGeodeIds(modelId),
        lineIds,
        (id) => {
          if (
            modelLinesCommonStyle.modelLineColoring(modelId, id).active === "vertex" &&
            modelLinesVertexAttributeName(modelId, id) === name
          ) {
            return [
              modelLinesVertexAttributeItem(modelId, id),
              modelLinesVertexAttributeRange(modelId, id),
              modelLinesVertexAttributeColorMap(modelId, id),
              JSON.stringify(modelLinesVertexAttributeNoDataColor(modelId, id)),
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
  async function setModelLinesVertexAttributeRange(
    modelId: ModelId,
    lineIds: LineId[],
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
    modelId: ModelId,
    lineIds: LineId[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    await setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeNoDataColor(
    modelId: ModelId,
    lineIds: LineId[],
    no_data_color: RGBAColor,
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
    modelLinesVertexAttributeTimeStep,
    setModelLinesVertexAttributeTimeStep,
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
export { useModelLinesVertexAttribute };
