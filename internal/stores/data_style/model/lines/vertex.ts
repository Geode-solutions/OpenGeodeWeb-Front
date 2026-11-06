// oxlint-disable eslint/max-lines
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
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
  modelLinesVertexAttributeName: (
    modelId: ModelId,
    lineId?: ModelComponentId,
  ) => string | undefined;
  modelLinesVertexAttributeItem: (modelId: ModelId, lineId?: ModelComponentId) => number;
  modelLinesVertexAttributeRange: (
    modelId: ModelId,
    lineId?: ModelComponentId,
  ) => [number | undefined, number | undefined];
  modelLinesVertexAttributeTimeStep: (
    modelId: ModelId,
    lineId?: ModelComponentId,
  ) => number | undefined;
  setModelLinesVertexAttributeTimeStep: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    timeStep: number,
  ) => Promise<void>;
  modelLinesVertexAttributeColorMap: (
    modelId: ModelId,
    lineId?: ModelComponentId,
  ) => string | undefined;
  modelLinesVertexAttributeStoredConfig: (
    modelId: ModelId,
    lineId: ModelComponentId | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelLinesVertexAttribute: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeName: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    name: string,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeItem: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    item: number,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeRange: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelLinesVertexAttributeColorMap: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelLinesVertexAttributeNoDataColor: (modelId: ModelId, lineId?: ModelComponentId) => RGBAColor;
  setModelLinesVertexAttributeNoDataColor: (
    modelId: ModelId,
    lineIds: ModelComponentId[],
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
    name: string | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelLinesVertexAttributeGetters(
  modelLinesCommonStyle: ReturnType<typeof useModelLinesCommonStyle>,
): ModelLinesVertexAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelLinesVertexAttribute(modelId: ModelId, lineId?: ModelComponentId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).vertex as AttributeState;
  }
  function modelLinesVertexAttributeStoredConfig(
    modelId: ModelId,
    lineId: ModelComponentId | undefined,
    name: string | undefined,
    item: number | undefined,
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
    lineId?: ModelComponentId,
  ): string | undefined {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }
  function modelLinesVertexAttributeLastItem(
    modelId: ModelId,
    lineId: ModelComponentId | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelLinesVertexAttributeItem(modelId: ModelId, lineId?: ModelComponentId): number {
    const vertexAttribute = modelLinesVertexAttribute(modelId, lineId);
    return (
      vertexAttribute.item ??
      modelLinesVertexAttributeLastItem(modelId, lineId, vertexAttribute.name)
    );
  }
  function modelLinesVertexAttributeRange(
    modelId: ModelId,
    lineId?: ModelComponentId,
  ): [number | undefined, number | undefined] {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelLinesVertexAttributeColorMap(
    modelId: ModelId,
    lineId?: ModelComponentId,
  ): string | undefined {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }
  function modelLinesVertexAttributeNoDataColor(
    modelId: ModelId,
    lineId?: ModelComponentId,
  ): RGBAColor {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.no_data_color;
  }
  function modelLinesVertexAttributeTimeStep(
    modelId: ModelId,
    lineId?: ModelComponentId,
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
    lineIds: ModelComponentId[],
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
    lineIds: ModelComponentId[],
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
  async function setModelLinesVertexAttribute(
    modelId: ModelId,
    lineIds: ModelComponentId[],
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
  async function applyVertexAttribute(
    modelId: ModelId,
    lineIds: ModelComponentId[],
  ): Promise<void> {
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
    lineIds: ModelComponentId[],
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
    modelId: ModelId,
    lineIds: ModelComponentId[],
    item: number,
  ): Promise<unknown> {
    await mutateModelLinesVertexStyle(modelId, lineIds, {
      item,
    });
    return applyVertexAttribute(modelId, lineIds);
  }
  async function setModelLinesVertexAttributeTimeStep(
    modelId: ModelId,
    lineIds: ModelComponentId[],
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
    lineIds: ModelComponentId[],
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
    lineIds: ModelComponentId[],
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
    lineIds: ModelComponentId[],
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
