// oxlint-disable eslint/max-lines
import type {
  AttributeInput,
  AttributeState,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ModelId, SurfaceId } from "@ogw_front/types/identifiers";
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
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon.attribute;

interface UseModelSurfacesPolygonAttributeReturn {
  modelSurfacesPolygonAttributeName: (
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ) => AttributeName | undefined;
  modelSurfacesPolygonAttributeItem: (modelId: ModelId, surfaceId?: SurfaceId) => AttributeItem;
  modelSurfacesPolygonAttributeRange: (modelId: ModelId, surfaceId?: SurfaceId) => AttributeRange;
  modelSurfacesPolygonAttributeTimeStep: (
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ) => number | undefined;
  setModelSurfacesPolygonAttributeTimeStep: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    timeStep: number,
  ) => Promise<void>;
  modelSurfacesPolygonAttributeColorMap: (
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ) => string | undefined;
  modelSurfacesPolygonAttributeStoredConfig: (
    modelId: ModelId,
    surfaceId: SurfaceId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setModelSurfacesPolygonAttribute: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setModelSurfacesPolygonAttributeName: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    name: AttributeName,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeItem: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    item: AttributeItem,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeRange: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    minimum: number,
    maximum: number,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeColorMap: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    colorMap: string | undefined,
  ) => Promise<void>;
  modelSurfacesPolygonAttributeNoDataColor: (modelId: ModelId, surfaceId?: SurfaceId) => RGBAColor;
  setModelSurfacesPolygonAttributeNoDataColor: (
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
    modelId: ModelId,
    componentId: string | undefined,
    name: AttributeName | undefined,
  ) => number;
};

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesPolygonAttributeGetters(
  modelSurfacesCommonStyle: ReturnType<typeof useModelSurfacesCommonStyle>,
): ModelSurfacesPolygonAttributeGetters {
  const { attributeTimeStep } = useAttributeTimeStepStyle();
  function modelSurfacesPolygonAttribute(modelId: ModelId, surfaceId?: SurfaceId): AttributeState {
    return (
      // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
      modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).polygon as AttributeState
    );
  }
  function modelSurfacesPolygonAttributeStoredConfig(
    modelId: ModelId,
    surfaceId: SurfaceId | undefined,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function modelSurfacesPolygonAttributeName(
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ): AttributeName | undefined {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesPolygonAttributeLastItem(
    modelId: ModelId,
    surfaceId: SurfaceId | undefined,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelSurfacesPolygonAttributeItem(
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ): AttributeItem {
    const polygonAttribute = modelSurfacesPolygonAttribute(modelId, surfaceId);
    return (
      polygonAttribute.item ??
      modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, polygonAttribute.name)
    );
  }
  function modelSurfacesPolygonAttributeRange(
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ): AttributeRange {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesPolygonAttributeColorMap(
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ): string | undefined {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  function modelSurfacesPolygonAttributeNoDataColor(
    modelId: ModelId,
    surfaceId?: SurfaceId,
  ): RGBAColor {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color;
  }
  function modelSurfacesPolygonAttributeTimeStep(
    modelId: ModelId,
    surfaceId?: SurfaceId,
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
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
      storedConfigs: { [name ?? ""]: { lastItem: item, [item ?? 0]: config } },
    });
  }
  async function setModelSurfacesPolygonAttribute(
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
  async function applyPolygonAttribute(modelId: ModelId, surfaceIds: SurfaceId[]): Promise<void> {
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
    if (isAttributeValid(attribute)) {
      await setModelSurfacesPolygonAttribute(modelId, surfaceIds, attribute);
    }
  }
  async function setModelSurfacesPolygonAttributeName(
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    name: AttributeName,
  ): Promise<void> {
    const item = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeItem(
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    item: AttributeItem,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeTimeStep(
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
    modelId: ModelId,
    surfaceIds: SurfaceId[],
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
export { useModelSurfacesPolygonAttribute };
