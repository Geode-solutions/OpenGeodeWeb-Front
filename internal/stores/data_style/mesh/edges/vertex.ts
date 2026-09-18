import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex;

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

function isMeshEdgesVertexAttributeValid({
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

interface UseMeshEdgesVertexAttributeStyleReturn {
  meshEdgesVertexAttributeName: (id: string) => string | undefined;
  meshEdgesVertexAttributeItem: (id: string) => number;
  meshEdgesVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeColorMap: (id: string) => string | undefined;
  meshEdgesVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesVertexAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshEdgesVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshEdgesVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshEdgesVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshEdgesVertexAttributeNoDataColor: (id: string, no_data_color: unknown) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesVertexAttributeStyle(): UseMeshEdgesVertexAttributeStyleReturn {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(id).vertex as AttributeState;
  }
  function meshEdgesVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
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
  async function mutateMeshEdgesVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshEdgesVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshEdgesVertexStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshEdgesVertexAttributeName(id: string): string | undefined {
    return meshEdgesVertexAttribute(id).name;
  }
  function meshEdgesVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesVertexAttributeItem(id: string): number {
    const { item, name } = meshEdgesVertexAttribute(id);
    return item ?? meshEdgesVertexAttributeLastItem(id, name);
  }
  async function setMeshEdgesVertexAttribute(
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
    await mutateMeshEdgesVertexStyle(id, {
      name,
      item,
    });
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const schema = meshEdgesVertexAttributeSchemas.attribute;
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
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshEdgesVertexAttributeValid(attribute)) {
      const result = await setMeshEdgesVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshEdgesVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshEdgesVertexAttributeLastItem(id, name);
    await mutateMeshEdgesVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshEdgesVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshEdgesVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  async function setMeshEdgesVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeColorMap(id: string): string | undefined {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  async function setMeshEdgesVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeNoDataColor(id: string): unknown {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshEdgesVertexAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttribute,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeItem,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeNoDataColor,
    setMeshEdgesVertexAttributeNoDataColor,
  };
}
export { isMeshEdgesVertexAttributeValid, useMeshEdgesVertexAttributeStyle };
