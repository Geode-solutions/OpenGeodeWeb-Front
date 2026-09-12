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

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesVertexAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();
  function modelSurfacesVertexAttribute(modelId: string, surfaceId?: string): AttributeState {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).vertex as AttributeState;
  }
  function modelSurfacesVertexAttributeStoredConfig(
    modelId: string,
    surfaceId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (
      storedConfigs &&
      name !== undefined &&
      name in storedConfigs &&
      item !== undefined &&
      item in storedConfigs[name]!
    ) {
      return storedConfigs[name]![item]!;
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  function mutateModelSurfacesVertexStyle(
    modelId: string,
    surfaceIds: string[],
    values: Record<string, unknown>,
  ) {
    if (surfaceIds.length > 1) {
      modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
        vertex: values,
      });
    }
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      vertex: values,
    });
  }
  function setModelSurfacesVertexAttributeStoredConfig(
    modelId: string,
    surfaceIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function modelSurfacesVertexAttributeName(modelId: string, surfaceId?: string): string | undefined {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }
  function modelSurfacesVertexAttributeLastItem(
    modelId: string,
    surfaceId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
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
  function modelSurfacesVertexAttributeColorMap(modelId: string, surfaceId?: string): string | undefined {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelSurfacesVertexAttribute(
    modelId: string,
    surfaceIds: string[],
    { name, item, minimum, maximum, colorMap, no_data_color = DEFAULT_NO_DATA_COLOR }: AttributeInput,
  ) {
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      name,
      item,
    });
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
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
    return viewerStore.request({
      schema: attributeSchema,
      params,
    });
  }
  function applyVertexAttribute(modelId: string, surfaceIds: string[]) {
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
      return setModelSurfacesVertexAttribute(modelId, surfaceIds, attribute);
    }
    return Promise.resolve();
  }
  function setModelSurfacesVertexAttributeName(modelId: string, surfaceIds: string[], name: string) {
    const item = modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeItem(modelId: string, surfaceIds: string[], item: number) {
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      item,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeRange(
    modelId: string,
    surfaceIds: string[],
    minimum: number,
    maximum: number,
  ) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeColorMap(
    modelId: string,
    surfaceIds: string[],
    colorMap: string | undefined,
  ) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, surfaceIds);
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
  ) {
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
    return applyVertexAttribute(modelId, surfaceIds);
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
