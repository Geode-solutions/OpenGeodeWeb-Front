import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

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

function isMeshPolyhedraVertexAttributeValid({
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

interface UseMeshPolyhedraVertexAttributeStyleReturn {
  meshPolyhedraVertexAttributeName: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeItem: (id: string) => number;
  meshPolyhedraVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraVertexAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshPolyhedraVertexAttributeNoDataColor: (
    id: string,
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraVertexAttributeStyle(): UseMeshPolyhedraVertexAttributeStyleReturn {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).vertex as AttributeState;
  }
  function meshPolyhedraVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
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
  async function mutateMeshPolyhedraVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPolyhedraVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshPolyhedraVertexAttributeName(id: string): string | undefined {
    return meshPolyhedraVertexAttribute(id).name;
  }
  function meshPolyhedraVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolyhedraVertexAttributeItem(id: string): number {
    const { item, name } = meshPolyhedraVertexAttribute(id);
    return item ?? meshPolyhedraVertexAttributeLastItem(id, name);
  }
  async function setMeshPolyhedraVertexAttribute(
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
    await mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const schema = meshPolyhedraVertexAttributeSchemas.attribute;
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
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolyhedraVertexAttributeValid(attribute)) {
      const result = await setMeshPolyhedraVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolyhedraVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPolyhedraVertexAttributeLastItem(id, name);
    await mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPolyhedraVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  async function setMeshPolyhedraVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  async function setMeshPolyhedraVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeNoDataColor(id: string): unknown {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolyhedraVertexAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeItem,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
    setMeshPolyhedraVertexAttributeNoDataColor,
  };
}
export { isMeshPolyhedraVertexAttributeValid, useMeshPolyhedraVertexAttributeStyle };
