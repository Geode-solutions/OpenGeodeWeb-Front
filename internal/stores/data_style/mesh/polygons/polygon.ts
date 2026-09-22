import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

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

function isMeshPolygonsPolygonAttributeValid({
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
function useMeshPolygonsPolygonAttributeStyle(): {
  meshPolygonsPolygonAttributeName: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeItem: (id: string) => number;
  meshPolygonsPolygonAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsPolygonAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (id: string) => unknown;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    id: string,
    no_data_color: unknown,
  ) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsPolygonAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).polygon as AttributeState;
  }
  function meshPolygonsPolygonAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
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
  async function mutateMeshPolygonsPolygonStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(id, values);
    return result;
  }
  async function setMeshPolygonsPolygonAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolygonsPolygonStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshPolygonsPolygonAttributeName(id: string): string | undefined {
    return meshPolygonsPolygonAttribute(id).name;
  }
  function meshPolygonsPolygonAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsPolygonAttributeItem(id: string): number {
    const { item, name } = meshPolygonsPolygonAttribute(id);
    return item ?? meshPolygonsPolygonAttributeLastItem(id, name);
  }
  async function setMeshPolygonsPolygonAttribute(
    id: string,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    await mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const schema = meshPolygonsPolygonAttributeSchemas.attribute;
    const params = {
      id,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema,
      params,
    });
  }
  async function applyPolygonAttribute(id: string): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsPolygonAttributeValid(attribute)) {
      const result = await setMeshPolygonsPolygonAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolygonsPolygonAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPolygonsPolygonAttributeLastItem(id, name);
    await mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPolygonsPolygonStyle(id, {
      item,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  async function setMeshPolygonsPolygonAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeColorMap(id: string): string | undefined {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  async function setMeshPolygonsPolygonAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeNoDataColor(id: string): unknown {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolygonsPolygonAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolygonAttribute(id);
  }
  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
    setMeshPolygonsPolygonAttributeNoDataColor,
  };
}
export { isMeshPolygonsPolygonAttributeValid, useMeshPolygonsPolygonAttributeStyle };
