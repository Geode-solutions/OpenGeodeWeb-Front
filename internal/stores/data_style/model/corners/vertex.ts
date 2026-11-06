// oxlint-disable eslint/max-lines
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";
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
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex.attribute;

type IdsFn<Value> = (modelId: DataId, cornerIds: string[], value: Value) => Promise<void>;

interface ModelCornersVertexAttributeApi {
  modelCornersVertexAttributeName: (modelId: DataId, cornerId?: string) => string | undefined;
  modelCornersVertexAttributeItem: (modelId: DataId, cornerId?: string) => number;
  modelCornersVertexAttributeRange: (
    modelId: DataId,
    cornerId?: string,
  ) => [number | undefined, number | undefined];
  modelCornersVertexAttributeTimeStep: (modelId: DataId, cornerId?: string) => number | undefined;
  setModelCornersVertexAttributeTimeStep: (
    modelId: DataId,
    cornerIds: string[],
    timeStep: number,
  ) => Promise<void>;
  modelCornersVertexAttributeColorMap: (modelId: DataId, cornerId?: string) => string | undefined;
  modelCornersVertexAttributeStoredConfig: (
    modelId: DataId,
    cornerId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelCornersVertexAttribute: (
    modelId: DataId,
    cornerIds: string[],
    attribute: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelCornersVertexAttributeName: IdsFn<string>;
  setModelCornersVertexAttributeItem: IdsFn<number>;
  setModelCornersVertexAttributeRange: (
    modelId: DataId,
    cornerIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<void>;
  setModelCornersVertexAttributeColorMap: IdsFn<string | undefined>;
  modelCornersVertexAttributeNoDataColor: (modelId: DataId, cornerId?: string) => RGBAColor;
  setModelCornersVertexAttributeNoDataColor: IdsFn<RGBAColor>;
}

type ModelCornersVertexAttributeGetters = Pick<
  ModelCornersVertexAttributeApi,
  | "modelCornersVertexAttributeStoredConfig"
  | "modelCornersVertexAttributeName"
  | "modelCornersVertexAttributeItem"
  | "modelCornersVertexAttributeRange"
  | "modelCornersVertexAttributeColorMap"
  | "modelCornersVertexAttributeNoDataColor"
  | "modelCornersVertexAttributeTimeStep"
> & {
  modelCornersVertexAttributeLastItem: (
    modelId: DataId,
    componentId: string | undefined,
    name: string | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelCornersVertexAttributeGetters(
  modelCornersCommonStyle: ReturnType<typeof useModelCornersCommonStyle>,
): ModelCornersVertexAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelCornersVertexAttribute(modelId: DataId, cornerId?: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- vertex is a StyleValues sub-object stored under a StyleValues index signature.
    return modelCornersCommonStyle.modelCornerColoring(modelId, cornerId).vertex as AttributeState;
  }
  function modelCornersVertexAttributeStoredConfig(
    modelId: DataId,
    cornerId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const storedConfig =
      name !== undefined && item !== undefined
        ? modelCornersVertexAttribute(modelId, cornerId).storedConfigs?.[name]?.[item]
        : undefined;
    if (storedConfig !== undefined) {
      return storedConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelCornersVertexAttributeName(modelId: DataId, cornerId?: string): string | undefined {
    return modelCornersVertexAttribute(modelId, cornerId).name;
  }
  function modelCornersVertexAttributeLastItem(
    modelId: DataId,
    cornerId: string | undefined,
    name: string | undefined,
  ): number {
    if (name === undefined) {
      return 0;
    }
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    return storedConfigs?.[name]?.lastItem ?? 0;
  }
  function modelCornersVertexAttributeItem(modelId: DataId, cornerId?: string): number {
    const vertexAttribute = modelCornersVertexAttribute(modelId, cornerId);
    return (
      vertexAttribute.item ??
      modelCornersVertexAttributeLastItem(modelId, cornerId, vertexAttribute.name)
    );
  }
  function modelCornersVertexAttributeRange(
    modelId: DataId,
    cornerId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const { minimum, maximum } = modelCornersVertexAttributeStoredConfig(
      modelId,
      cornerId,
      name,
      item,
    );
    return [minimum, maximum];
  }
  function modelCornersVertexAttributeColorMap(
    modelId: DataId,
    cornerId?: string,
  ): string | undefined {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    return modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item).colorMap;
  }
  function modelCornersVertexAttributeNoDataColor(modelId: DataId, cornerId?: string): RGBAColor {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    return modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item).no_data_color;
  }
  function modelCornersVertexAttributeTimeStep(
    modelId: DataId,
    cornerId?: string,
  ): number | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelCornersVertexAttribute(modelId, cornerId).name,
    );
  }
  return {
    modelCornersVertexAttributeStoredConfig,
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeLastItem,
    modelCornersVertexAttributeItem,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeNoDataColor,
    modelCornersVertexAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelCornersVertexAttribute(): ModelCornersVertexAttributeApi {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const {
    modelCornersVertexAttributeStoredConfig,
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeLastItem,
    modelCornersVertexAttributeItem,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeNoDataColor,
    modelCornersVertexAttributeTimeStep,
  } = useModelCornersVertexAttributeGetters(modelCornersCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelCornersVertexStyle(
    modelId: DataId,
    cornerIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelCornersCommonStyle.mutateModelCornersColoring(modelId, cornerIds, {
        vertex: values,
      }),
    ];
    const totalCornerIds = await dataStore.getCornersGeodeIds(modelId);
    if (cornerIds.length === totalCornerIds.length) {
      tasks.push(
        modelCornersCommonStyle.mutateModelCornersTypeColoring(modelId, {
          vertex: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelCornersVertexAttributeStoredConfig(
    modelId: DataId,
    cornerIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelCornersVertexStyle(modelId, cornerIds, {
      storedConfigs: { [name]: { lastItem: item, [item]: config } },
    });
  }
  async function setModelCornersVertexAttribute(
    modelId: DataId,
    cornerIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateModelCornersVertexStyle(modelId, cornerIds, { name, item });
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = {
      id: modelId,
      block_ids: corner_viewer_ids,
      name: seriesArrayName(modelId, attributeSchema.$id, name),
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    const result = await viewerStore.request({
      schema: attributeSchema,
      params,
    });
    return result;
  }
  async function applyVertexAttribute(modelId: DataId, cornerIds: string[]): Promise<void> {
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
    if (isAttributeValid(attribute)) {
      await setModelCornersVertexAttribute(modelId, cornerIds, attribute);
    }
  }
  async function setModelCornersVertexAttributeName(
    modelId: DataId,
    cornerIds: string[],
    name: string,
  ): Promise<void> {
    const item = modelCornersVertexAttributeLastItem(modelId, cornerIds[0], name);
    await mutateModelCornersVertexStyle(modelId, cornerIds, { name, item });
    await applyVertexAttribute(modelId, cornerIds);
  }
  async function setModelCornersVertexAttributeItem(
    modelId: DataId,
    cornerIds: string[],
    item: number,
  ): Promise<void> {
    await mutateModelCornersVertexStyle(modelId, cornerIds, { item });
    await applyVertexAttribute(modelId, cornerIds);
  }
  async function setModelCornersVertexAttributeTimeStep(
    modelId: DataId,
    cornerIds: string[],
    timeStep: number,
  ): Promise<void> {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyVertexAttribute(modelId, cornerIds),
      reapplySameSeries(
        await dataStore.getCornersGeodeIds(modelId),
        cornerIds,
        (id) => {
          if (
            modelCornersCommonStyle.modelCornerColoring(modelId, id).active === "vertex" &&
            modelCornersVertexAttributeName(modelId, id) === name
          ) {
            return [
              modelCornersVertexAttributeItem(modelId, id),
              modelCornersVertexAttributeRange(modelId, id),
              modelCornersVertexAttributeColorMap(modelId, id),
              JSON.stringify(modelCornersVertexAttributeNoDataColor(modelId, id)),
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
  async function setModelCornersVertexAttributeRange(
    modelId: DataId,
    cornerIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<void> {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
    });
    await applyVertexAttribute(modelId, cornerIds);
  }
  async function setModelCornersVertexAttributeColorMap(
    modelId: DataId,
    cornerIds: string[],
    colorMap: string | undefined,
  ): Promise<void> {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, { colorMap });
    await applyVertexAttribute(modelId, cornerIds);
  }
  async function setModelCornersVertexAttributeNoDataColor(
    modelId: DataId,
    cornerIds: string[],
    no_data_color: RGBAColor,
  ): Promise<void> {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    await applyVertexAttribute(modelId, cornerIds);
  }
  return {
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeTimeStep,
    setModelCornersVertexAttributeTimeStep,
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
export { useModelCornersVertexAttribute };
