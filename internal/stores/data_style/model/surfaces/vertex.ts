// oxlint-disable eslint/max-lines
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  reapplySameSeries,
  useAttributeTimeStepStyle,
} from "@ogw_internal/stores/data_style/time_step";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex.attribute;

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: RGBAColor;
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
  no_data_color?: RGBAColor;
}

interface ValidAttributeInput {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
}

function isModelSurfacesVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseModelSurfacesVertexAttributeReturn {
  modelSurfacesVertexAttributeName: (modelId: DataId, surfaceId?: string) => string | undefined;
  modelSurfacesVertexAttributeItem: (modelId: DataId, surfaceId?: string) => number;
  modelSurfacesVertexAttributeRange: (
    modelId: DataId,
    surfaceId?: string,
  ) => [number | undefined, number | undefined];
  modelSurfacesVertexAttributeTimeStep: (modelId: DataId, surfaceId?: string) => number | undefined;
  setModelSurfacesVertexAttributeTimeStep: (
    modelId: DataId,
    surfaceIds: string[],
    timeStep: number,
  ) => Promise<void>;
  modelSurfacesVertexAttributeColorMap: (modelId: DataId, surfaceId?: string) => string | undefined;
  modelSurfacesVertexAttributeStoredConfig: (
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelSurfacesVertexAttribute: (
    modelId: DataId,
    surfaceIds: string[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeName: (
    modelId: DataId,
    surfaceIds: string[],
    name: string,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeItem: (
    modelId: DataId,
    surfaceIds: string[],
    item: number,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeRange: (
    modelId: DataId,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeColorMap: (
    modelId: DataId,
    surfaceIds: string[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelSurfacesVertexAttributeNoDataColor: (modelId: DataId, surfaceId?: string) => RGBAColor;
  setModelSurfacesVertexAttributeNoDataColor: (
    modelId: DataId,
    surfaceIds: string[],
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}

type ModelSurfacesVertexAttributeGetters = Pick<
  UseModelSurfacesVertexAttributeReturn,
  | "modelSurfacesVertexAttributeStoredConfig"
  | "modelSurfacesVertexAttributeName"
  | "modelSurfacesVertexAttributeItem"
  | "modelSurfacesVertexAttributeRange"
  | "modelSurfacesVertexAttributeColorMap"
  | "modelSurfacesVertexAttributeNoDataColor"
  | "modelSurfacesVertexAttributeTimeStep"
> & {
  modelSurfacesVertexAttributeLastItem: (
    modelId: DataId,
    componentId: string | undefined,
    name: string | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesVertexAttributeGetters(
  modelSurfacesCommonStyle: ReturnType<typeof useModelSurfacesCommonStyle>,
): ModelSurfacesVertexAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelSurfacesVertexAttribute(modelId: DataId, surfaceId?: string): AttributeState {
    return (
      // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
      modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).vertex as AttributeState
    );
  }
  function modelSurfacesVertexAttributeStoredConfig(
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
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
  function modelSurfacesVertexAttributeName(
    modelId: DataId,
    surfaceId?: string,
  ): string | undefined {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesVertexAttributeLastItem(
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelSurfacesVertexAttributeItem(modelId: DataId, surfaceId?: string): number {
    const vertexAttribute = modelSurfacesVertexAttribute(modelId, surfaceId);
    return (
      vertexAttribute.item ??
      modelSurfacesVertexAttributeLastItem(modelId, surfaceId, vertexAttribute.name)
    );
  }
  function modelSurfacesVertexAttributeRange(
    modelId: DataId,
    surfaceId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesVertexAttributeColorMap(
    modelId: DataId,
    surfaceId?: string,
  ): string | undefined {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  function modelSurfacesVertexAttributeNoDataColor(modelId: DataId, surfaceId?: string): RGBAColor {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color;
  }
  function modelSurfacesVertexAttributeTimeStep(
    modelId: DataId,
    surfaceId?: string,
  ): number | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelSurfacesVertexAttribute(modelId, surfaceId).name,
    );
  }
  return {
    modelSurfacesVertexAttributeStoredConfig,
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeLastItem,
    modelSurfacesVertexAttributeItem,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeNoDataColor,
    modelSurfacesVertexAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesVertexAttribute(): UseModelSurfacesVertexAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const {
    modelSurfacesVertexAttributeStoredConfig,
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeLastItem,
    modelSurfacesVertexAttributeItem,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeNoDataColor,
    modelSurfacesVertexAttributeTimeStep,
  } = useModelSurfacesVertexAttributeGetters(modelSurfacesCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelSurfacesVertexStyle(
    modelId: DataId,
    surfaceIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
        vertex: values,
      }),
    ];
    const totalSurfaceIds = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaceIds.length === totalSurfaceIds.length) {
      tasks.push(
        modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
          vertex: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelSurfacesVertexAttributeStoredConfig(
    modelId: DataId,
    surfaceIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      storedConfigs: { [name ?? ""]: { lastItem: item, [item ?? 0]: config } },
    });
  }
  async function setModelSurfacesVertexAttribute(
    modelId: DataId,
    surfaceIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { name, item });
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = {
      id: modelId,
      block_ids: surface_viewer_ids,
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
  async function applyVertexAttribute(modelId: DataId, surfaceIds: string[]): Promise<unknown> {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
      modelId,
      surfaceIds[0],
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
    if (isModelSurfacesVertexAttributeValid(attribute)) {
      const result = await setModelSurfacesVertexAttribute(modelId, surfaceIds, attribute);
      return result;
    }
    return undefined;
  }
  async function setModelSurfacesVertexAttributeName(
    modelId: DataId,
    surfaceIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { name, item });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeItem(
    modelId: DataId,
    surfaceIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { item });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeTimeStep(
    modelId: DataId,
    surfaceIds: string[],
    timeStep: number,
  ): Promise<void> {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyVertexAttribute(modelId, surfaceIds),
      reapplySameSeries(
        await dataStore.getSurfacesGeodeIds(modelId),
        surfaceIds,
        (id) => {
          if (
            modelSurfacesCommonStyle.modelSurfaceColoring(modelId, id).active === "vertex" &&
            modelSurfacesVertexAttributeName(modelId, id) === name
          ) {
            return [
              modelSurfacesVertexAttributeItem(modelId, id),
              modelSurfacesVertexAttributeRange(modelId, id),
              modelSurfacesVertexAttributeColorMap(modelId, id),
              JSON.stringify(modelSurfacesVertexAttributeNoDataColor(modelId, id)),
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
  async function setModelSurfacesVertexAttributeRange(
    modelId: DataId,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeColorMap(
    modelId: DataId,
    surfaceIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeNoDataColor(
    modelId: DataId,
    surfaceIds: string[],
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeTimeStep,
    setModelSurfacesVertexAttributeTimeStep,
    modelSurfacesVertexAttributeItem,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeStoredConfig,
    setModelSurfacesVertexAttribute,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeItem,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeNoDataColor,
    setModelSurfacesVertexAttributeNoDataColor,
  };
}
export { isModelSurfacesVertexAttributeValid, useModelSurfacesVertexAttribute };
