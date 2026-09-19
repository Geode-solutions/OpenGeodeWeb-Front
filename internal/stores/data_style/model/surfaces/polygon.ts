// oxlint-disable eslint/max-lines
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
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

function isModelSurfacesPolygonAttributeValid({
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

interface UseModelSurfacesPolygonAttributeReturn {
  modelSurfacesPolygonAttributeName: (modelId: string, surfaceId?: string) => string | undefined;
  modelSurfacesPolygonAttributeItem: (modelId: string, surfaceId?: string) => number;
  modelSurfacesPolygonAttributeRange: (
    modelId: string,
    surfaceId?: string,
  ) => [number | undefined, number | undefined];
  modelSurfacesPolygonAttributeColorMap: (
    modelId: string,
    surfaceId?: string,
  ) => string | undefined;
  modelSurfacesPolygonAttributeStoredConfig: (
    modelId: string,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelSurfacesPolygonAttribute: (
    modelId: string,
    surfaceIds: string[],
    input: AttributeInput,
  ) => Promise<unknown>;
  setModelSurfacesPolygonAttributeName: (
    modelId: string,
    surfaceIds: string[],
    name: string,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeItem: (
    modelId: string,
    surfaceIds: string[],
    item: number,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeRange: (
    modelId: string,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<void>;
  setModelSurfacesPolygonAttributeColorMap: (
    modelId: string,
    surfaceIds: string[],
    colorMap: string | undefined,
  ) => Promise<void>;
  modelSurfacesPolygonAttributeNoDataColor: (modelId: string, surfaceId?: string) => unknown;
  setModelSurfacesPolygonAttributeNoDataColor: (
    modelId: string,
    surfaceIds: string[],
    no_data_color: unknown,
  ) => Promise<void>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesPolygonAttribute(): UseModelSurfacesPolygonAttributeReturn {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();
  function modelSurfacesPolygonAttribute(modelId: string, surfaceId?: string): AttributeState {
    return (
      modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId)
        // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
        .polygon as AttributeState
    );
  }
  function modelSurfacesPolygonAttributeStoredConfig(
    modelId: string,
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
  async function mutateModelSurfacesPolygonStyle(
    modelId: string,
    surfaceIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    if (surfaceIds.length > 1) {
      await modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, { polygon: values });
    }
    await modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      polygon: values,
    });
  }
  async function setModelSurfacesPolygonAttributeStoredConfig(
    modelId: string,
    surfaceIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
      storedConfigs: { [name ?? ""]: { lastItem: item, [item ?? 0]: config } },
    });
  }
  function modelSurfacesPolygonAttributeName(
    modelId: string,
    surfaceId?: string,
  ): string | undefined {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesPolygonAttributeLastItem(
    modelId: string,
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
  function modelSurfacesPolygonAttributeItem(modelId: string, surfaceId?: string): number {
    const polygonAttribute = modelSurfacesPolygonAttribute(modelId, surfaceId);
    return (
      polygonAttribute.item ??
      modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, polygonAttribute.name)
    );
  }
  function modelSurfacesPolygonAttributeRange(
    modelId: string,
    surfaceId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesPolygonAttributeColorMap(
    modelId: string,
    surfaceId?: string,
  ): string | undefined {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelSurfacesPolygonAttribute(
    modelId: string,
    surfaceIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = {
      id: modelId,
      block_ids: surface_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    const result = await viewerStore.request({ schema: attributeSchema, params });
    return result;
  }
  async function applyPolygonAttribute(modelId: string, surfaceIds: string[]): Promise<void> {
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
    modelId: string,
    surfaceIds: string[],
    name: string,
  ): Promise<void> {
    const item = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeItem(
    modelId: string,
    surfaceIds: string[],
    item: number,
  ): Promise<void> {
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { item });
    await applyPolygonAttribute(modelId, surfaceIds);
  }
  async function setModelSurfacesPolygonAttributeRange(
    modelId: string,
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
    modelId: string,
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
  function modelSurfacesPolygonAttributeNoDataColor(modelId: string, surfaceId?: string): unknown {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelSurfacesPolygonAttributeNoDataColor(
    modelId: string,
    surfaceIds: string[],
    no_data_color: unknown,
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
