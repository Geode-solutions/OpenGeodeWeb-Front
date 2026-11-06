import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraVertexAttributeConfigReturn {
  meshPolyhedraVertexAttribute: (id: string) => AttributeState;
  meshPolyhedraVertexAttributeName: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeLastItem: (id: string, name: string | undefined) => number;
  meshPolyhedraVertexAttributeItem: (id: string) => number;
  meshPolyhedraVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraVertexAttributeConfigWriterReturn {
  mutateMeshPolyhedraVertexStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshPolyhedraVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolyhedraVertexAttributeConfig(): UseMeshPolyhedraVertexAttributeConfigReturn {
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
  return {
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeLastItem,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  };
}

interface UseMeshPolyhedraVertexAttributeConfigValuesReturn {
  meshPolyhedraVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshPolyhedraVertexAttributeConfigValues(): UseMeshPolyhedraVertexAttributeConfigValuesReturn {
  const {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  } = useMeshPolyhedraVertexAttributeConfig();
  function meshPolyhedraVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraVertexAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
  };
}

function useMeshPolyhedraVertexAttributeConfigWriter(): UseMeshPolyhedraVertexAttributeConfigWriterReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
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
  return {
    mutateMeshPolyhedraVertexStyle,
    setMeshPolyhedraVertexAttributeStoredConfig,
  };
}
export {
  useMeshPolyhedraVertexAttributeConfig,
  useMeshPolyhedraVertexAttributeConfigValues,
  useMeshPolyhedraVertexAttributeConfigWriter,
};
