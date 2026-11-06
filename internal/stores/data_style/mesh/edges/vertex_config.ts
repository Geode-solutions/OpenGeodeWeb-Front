import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesVertexAttributeConfigReturn {
  meshEdgesVertexAttribute: (id: string) => AttributeState;
  meshEdgesVertexAttributeName: (id: string) => string | undefined;
  meshEdgesVertexAttributeLastItem: (id: string, name: string | undefined) => number;
  meshEdgesVertexAttributeItem: (id: string) => number;
  meshEdgesVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesVertexAttributeConfigWriterReturn {
  mutateMeshEdgesVertexStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesVertexAttributeConfig(): UseMeshEdgesVertexAttributeConfigReturn {
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
  return {
    meshEdgesVertexAttribute,
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeLastItem,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeStoredConfig,
  };
}

interface UseMeshEdgesVertexAttributeConfigValuesReturn {
  meshEdgesVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeColorMap: (id: string) => string | undefined;
  meshEdgesVertexAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshEdgesVertexAttributeConfigValues(): UseMeshEdgesVertexAttributeConfigValuesReturn {
  const {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeStoredConfig,
  } = useMeshEdgesVertexAttributeConfig();
  function meshEdgesVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesVertexAttributeColorMap(id: string): string | undefined {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesVertexAttributeNoDataColor(id: string): RGBAColor {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeNoDataColor,
  };
}

function useMeshEdgesVertexAttributeConfigWriter(): UseMeshEdgesVertexAttributeConfigWriterReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
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
  return {
    mutateMeshEdgesVertexStyle,
    setMeshEdgesVertexAttributeStoredConfig,
  };
}
export {
  useMeshEdgesVertexAttributeConfig,
  useMeshEdgesVertexAttributeConfigValues,
  useMeshEdgesVertexAttributeConfigWriter,
};
