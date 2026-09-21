import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

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

function isMeshPolygonsVertexAttributeValid({
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

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (id: string) => string | undefined;
  meshPolygonsVertexAttributeItem: (id: string) => number;
  meshPolygonsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshPolygonsVertexAttributeNoDataColor: (
    id: string,
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsVertexAttributeStyle(): UseMeshPolygonsVertexAttributeStyleReturn {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).vertex as AttributeState;
  }
  function meshPolygonsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
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
  async function mutateMeshPolygonsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPolygonsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolygonsVertexStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshPolygonsVertexAttributeName(id: string): string | undefined {
    return meshPolygonsVertexAttribute(id).name;
  }
  function meshPolygonsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsVertexAttributeItem(id: string): number {
    const { item, name } = meshPolygonsVertexAttribute(id);
    return item ?? meshPolygonsVertexAttributeLastItem(id, name);
  }
  async function setMeshPolygonsVertexAttribute(
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
    await mutateMeshPolygonsVertexStyle(id, {
      name,
      item,
    });
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const schema = meshPolygonsVertexAttributeSchemas.attribute;
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
  async function applyVertexAttribute(id: string): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsVertexAttributeValid(attribute)) {
      const result = await setMeshPolygonsVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolygonsVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPolygonsVertexAttributeLastItem(id, name);
    await mutateMeshPolygonsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolygonsVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPolygonsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshPolygonsVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  async function setMeshPolygonsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshPolygonsVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  async function setMeshPolygonsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPolygonsVertexAttributeNoDataColor(id: string): unknown {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolygonsVertexAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeItem,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoDataColor,
    setMeshPolygonsVertexAttributeNoDataColor,
  };
}
export { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle };
