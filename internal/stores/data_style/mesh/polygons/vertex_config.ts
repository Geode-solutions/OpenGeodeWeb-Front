import type { AttributeState, AttributeStoredConfig } from "./vertex_attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsVertexAttributeConfigReturn {
  meshPolygonsVertexAttribute: (id: string) => AttributeState;
  meshPolygonsVertexAttributeName: (id: string) => string | undefined;
  meshPolygonsVertexAttributeLastItem: (id: string, name: string | undefined) => number;
  meshPolygonsVertexAttributeItem: (id: string) => number;
  meshPolygonsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsVertexAttributeConfigWriterReturn {
  mutateMeshPolygonsVertexStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshPolygonsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolygonsVertexAttributeConfig(): UseMeshPolygonsVertexAttributeConfigReturn {
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
  return {
    meshPolygonsVertexAttribute,
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeLastItem,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  };
}

interface UseMeshPolygonsVertexAttributeConfigValuesReturn {
  meshPolygonsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsVertexAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshPolygonsVertexAttributeConfigValues(): UseMeshPolygonsVertexAttributeConfigValuesReturn {
  const {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  } = useMeshPolygonsVertexAttributeConfig();
  function meshPolygonsVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsVertexAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoDataColor,
  };
}

function useMeshPolygonsVertexAttributeConfigWriter(): UseMeshPolygonsVertexAttributeConfigWriterReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
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
  return {
    mutateMeshPolygonsVertexStyle,
    setMeshPolygonsVertexAttributeStoredConfig,
  };
}
export {
  useMeshPolygonsVertexAttributeConfig,
  useMeshPolygonsVertexAttributeConfigValues,
  useMeshPolygonsVertexAttributeConfigWriter,
};
