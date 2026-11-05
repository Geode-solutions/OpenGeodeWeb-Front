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
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon.attribute;

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

function isModelSurfacesPolygonAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseModelSurfacesPolygonAttributeReturn {
  modelSurfacesPolygonAttributeName: (modelId: DataId, surfaceId?: string) => string | undefined;
  modelSurfacesPolygonAttributeItem: (modelId: DataId, surfaceId?: string) => number;
  modelSurfacesPolygonAttributeRange: (
    modelId: DataId,
    surfaceId?: string,
  ) => [number | undefined, number | undefined];
  modelSurfacesPolygonAttributeTimeStep: (
    modelId: DataId,
    surfaceId?: string,
  ) => number | undefined;
  setModelSurfacesPolygonAttributeTimeStep: (
    modelId: DataId,
    surfaceIds: string[],
    timeStep: number,
  ) => Promise<void>;
  modelSurfacesPolygonAttributeColorMap: (
    modelId: DataId,
    surfaceId?: string,
  ) => string | undefined;
  modelSurfacesPolygonAttributeStoredConfig: (
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelSurfacesPolygonAttribute: (
    modelId: DataId,
    surfaceIds: string[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelSurfacesPolygonAttributeName: (
    modelId: DataId,
    surfaceIds: string[],
    name: string,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeItem: (
    modelId: DataId,
    surfaceIds: string[],
    item: number,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeRange: (
    modelId: DataId,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeColorMap: (
    modelId: DataId,
    surfaceIds: string[],
    colorMap: string | undefined,
  ) => Promise<void>;
  modelSurfacesPolygonAttributeNoDataColor: (modelId: DataId, surfaceId?: string) => RGBAColor;
  setModelSurfacesPolygonAttributeNoDataColor: (
    modelId: DataId,
    surfaceIds: string[],
    no_data_color: RGBAColor,
  ) => Promise<void>;
}

type ModelSurfacesPolygonAttributeGetters = Pick<
  UseModelSurfacesPolygonAttributeReturn,
  | "modelSurfacesPolygonAttributeStoredConfig"
  | "modelSurfacesPolygonAttributeName"
  | "modelSurfacesPolygonAttributeItem"
  | "modelSurfacesPolygonAttributeRange"
  | "modelSurfacesPolygonAttributeColorMap"
  | "modelSurfacesPolygonAttributeNoDataColor"
  | "modelSurfacesPolygonAttributeTimeStep"
> & {
  modelSurfacesPolygonAttributeLastItem: (
    modelId: DataId,
    componentId: string | undefined,
    name: string | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesPolygonAttributeGetters(
  modelSurfacesCommonStyle: ReturnType<typeof useModelSurfacesCommonStyle>,
): ModelSurfacesPolygonAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelSurfacesPolygonAttribute(modelId: DataId, surfaceId?: string): AttributeState {
    return (
      // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
      modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).polygon as AttributeState
    );
  }
  function modelSurfacesPolygonAttributeStoredConfig(
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
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
  function modelSurfacesPolygonAttributeName(
    modelId: DataId,
    surfaceId?: string,
  ): string | undefined {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesPolygonAttributeLastItem(
    modelId: DataId,
    surfaceId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelSurfacesPolygonAttributeItem(modelId: DataId, surfaceId?: string): number {
    const polygonAttribute = modelSurfacesPolygonAttribute(modelId, surfaceId);
    return (
      polygonAttribute.item ??
      modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, polygonAttribute.name)
    );
  }
  function modelSurfacesPolygonAttributeRange(
    modelId: DataId,
    surfaceId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesPolygonAttributeColorMap(
    modelId: DataId,
    surfaceId?: string,
  ): string | undefined {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  function modelSurfacesPolygonAttributeNoDataColor(
    modelId: DataId,
    surfaceId?: string,
  ): RGBAColor {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color;
  }
  function modelSurfacesPolygonAttributeTimeStep(
    modelId: DataId,
    surfaceId?: string,
  ): number | undefined {
    return attributeTimeStep(
      modelId,
      attributeSchema.$id,
      modelSurfacesPolygonAttribute(modelId, surfaceId).name,
    );
  }
  return {
    modelSurfacesPolygonAttributeStoredConfig,
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeLastItem,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeNoDataColor,
    modelSurfacesPolygonAttributeTimeStep,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesPolygonAttribute(): UseModelSurfacesPolygonAttributeReturn {
  const { setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const {
    modelSurfacesPolygonAttributeStoredConfig,
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeLastItem,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeNoDataColor,
    modelSurfacesPolygonAttributeTimeStep,
  } = useModelSurfacesPolygonAttributeGetters(modelSurfacesCommonStyle);
  const viewerStore = useViewerStore();
  async function mutateModelSurfacesPolygonStyle(
    modelId: DataId,
    surfaceIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
        polygon: values,
      }),
    ];
    const totalSurfaceIds = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaceIds.length === totalSurfaceIds.length) {
      tasks.push(
        modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
          polygon: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelSurfacesPolygonAttributeStoredConfig(
    modelId: DataId,
    surfaceIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
      storedConfigs: { [name ?? ""]: { lastItem: item, [item ?? 0]: config } },
    });
  }
  async function setModelSurfacesPolygonAttribute(
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
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
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
  async function applyPolygonAttribute(modelId: DataId, surfaceIds: string[]): Promise<void> {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
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
    if (isModelSurfacesPolygonAttributeValid(attribute)) {
      await setModelSurfacesPolygonAttribute(modelId, surfaceIds, attribute);
    }
  }
  async function setModelSurfacesPolygonAttributeName(
    modelId: DataId,
    surfaceIds: string[],
    name: string,
  ): Promise<void> {
    const item = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeItem(
    modelId: DataId,
    surfaceIds: string[],
    item: number,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeTimeStep(
    modelId: DataId,
    surfaceIds: string[],
    timeStep: number,
  ): Promise<void> {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    if (name === undefined) {
      return;
    }
    await setAttributeTimeStep(modelId, attributeSchema.$id, name, timeStep);
    await Promise.all([
      applyPolygonAttribute(modelId, surfaceIds),
      reapplySameSeries(
        await dataStore.getSurfacesGeodeIds(modelId),
        surfaceIds,
        (id) => {
          if (
            modelSurfacesCommonStyle.modelSurfaceColoring(modelId, id).active === "polygon" &&
            modelSurfacesPolygonAttributeName(modelId, id) === name
          ) {
            return [
              modelSurfacesPolygonAttributeItem(modelId, id),
              modelSurfacesPolygonAttributeRange(modelId, id),
              modelSurfacesPolygonAttributeColorMap(modelId, id),
              JSON.stringify(modelSurfacesPolygonAttributeNoDataColor(modelId, id)),
            ].join("|");
          }
          return undefined;
        },
        async (ids) => {
          await applyPolygonAttribute(modelId, ids);
        },
      ),
    ]);
  }
  async function setModelSurfacesPolygonAttributeRange(
    modelId: DataId,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<void> {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeColorMap(
    modelId: DataId,
    surfaceIds: string[],
    colorMap: string | undefined,
  ): Promise<void> {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeNoDataColor(
    modelId: DataId,
    surfaceIds: string[],
    no_data_color: RGBAColor,
  ): Promise<void> {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  return {
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeTimeStep,
    setModelSurfacesPolygonAttributeTimeStep,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeStoredConfig,
    setModelSurfacesPolygonAttribute,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeItem,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeNoDataColor,
    setModelSurfacesPolygonAttributeNoDataColor,
  };
}
export { isModelSurfacesPolygonAttributeValid, useModelSurfacesPolygonAttribute };
