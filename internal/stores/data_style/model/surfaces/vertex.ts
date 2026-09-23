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
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex.attribute;

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

function isModelSurfacesVertexAttributeValid({
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

interface UseModelSurfacesVertexAttributeReturn {
  modelSurfacesVertexAttributeName: (modelId: string, surfaceId?: string) => string | undefined;
  modelSurfacesVertexAttributeItem: (modelId: string, surfaceId?: string) => number;
  modelSurfacesVertexAttributeRange: (
    modelId: string,
    surfaceId?: string,
  ) => [number | undefined, number | undefined];
  modelSurfacesVertexAttributeColorMap: (modelId: string, surfaceId?: string) => string | undefined;
  modelSurfacesVertexAttributeStoredConfig: (
    modelId: string,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelSurfacesVertexAttribute: (
    modelId: string,
    surfaceIds: string[],
    input: AttributeInput,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeName: (
    modelId: string,
    surfaceIds: string[],
    name: string,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeItem: (
    modelId: string,
    surfaceIds: string[],
    item: number,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeRange: (
    modelId: string,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelSurfacesVertexAttributeColorMap: (
    modelId: string,
    surfaceIds: string[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelSurfacesVertexAttributeNoDataColor: (modelId: string, surfaceId?: string) => unknown;
  setModelSurfacesVertexAttributeNoDataColor: (
    modelId: string,
    surfaceIds: string[],
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesVertexAttribute(): UseModelSurfacesVertexAttributeReturn {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();
  function modelSurfacesVertexAttribute(modelId: string, surfaceId?: string): AttributeState {
    return (
      modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId)
        // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
        .vertex as AttributeState
    );
  }
  function modelSurfacesVertexAttributeStoredConfig(
    modelId: string,
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
  async function mutateModelSurfacesVertexStyle(
    modelId: string,
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
        modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, { vertex: values }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelSurfacesVertexAttributeStoredConfig(
    modelId: string,
    surfaceIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      storedConfigs: { [name ?? ""]: { lastItem: item, [item ?? 0]: config } },
    });
  }
  function modelSurfacesVertexAttributeName(
    modelId: string,
    surfaceId?: string,
  ): string | undefined {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesVertexAttributeLastItem(
    modelId: string,
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
  function modelSurfacesVertexAttributeItem(modelId: string, surfaceId?: string): number {
    const vertexAttribute = modelSurfacesVertexAttribute(modelId, surfaceId);
    return (
      vertexAttribute.item ??
      modelSurfacesVertexAttributeLastItem(modelId, surfaceId, vertexAttribute.name)
    );
  }
  function modelSurfacesVertexAttributeRange(
    modelId: string,
    surfaceId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesVertexAttributeColorMap(
    modelId: string,
    surfaceId?: string,
  ): string | undefined {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelSurfacesVertexAttribute(
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
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { name, item });
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
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
  async function applyVertexAttribute(modelId: string, surfaceIds: string[]): Promise<unknown> {
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
    modelId: string,
    surfaceIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { name, item });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeItem(
    modelId: string,
    surfaceIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, { item });
    const result = await applyVertexAttribute(modelId, surfaceIds);
    return result;
  }
  async function setModelSurfacesVertexAttributeRange(
    modelId: string,
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
    modelId: string,
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
  function modelSurfacesVertexAttributeNoDataColor(modelId: string, surfaceId?: string): unknown {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelSurfacesVertexAttributeNoDataColor(
    modelId: string,
    surfaceIds: string[],
    no_data_color: unknown,
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
