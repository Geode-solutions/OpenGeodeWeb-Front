import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshPointsCommonStyle } from "./common";

interface UseMeshPointsVertexAttributeConfigReturn {
  meshPointsVertexAttribute: (id: string) => AttributeState;
  meshPointsVertexAttributeName: (id: string) => string | undefined;
  meshPointsVertexAttributeLastItem: (id: string, name: string | undefined) => number;
  meshPointsVertexAttributeItem: (id: string) => number;
  meshPointsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPointsVertexAttributeConfigWriterReturn {
  mutateMeshPointsVertexStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshPointsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPointsVertexAttributeConfig(): UseMeshPointsVertexAttributeConfigReturn {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  function meshPointsVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(id).vertex as AttributeState;
  }
  function meshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPointsVertexAttribute(id);
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
  function meshPointsVertexAttributeName(id: string): string | undefined {
    return meshPointsVertexAttribute(id).name;
  }
  function meshPointsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPointsVertexAttributeItem(id: string): number {
    const { item, name } = meshPointsVertexAttribute(id);
    return item ?? meshPointsVertexAttributeLastItem(id, name);
  }
  return {
    meshPointsVertexAttribute,
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeLastItem,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeStoredConfig,
  };
}

interface UseMeshPointsVertexAttributeConfigValuesReturn {
  meshPointsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPointsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPointsVertexAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshPointsVertexAttributeConfigValues(): UseMeshPointsVertexAttributeConfigValuesReturn {
  const {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeStoredConfig,
  } = useMeshPointsVertexAttributeConfig();
  function meshPointsVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPointsVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshPointsVertexAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeNoDataColor,
  };
}

function useMeshPointsVertexAttributeConfigWriter(): UseMeshPointsVertexAttributeConfigWriterReturn {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  async function mutateMeshPointsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPointsVertexStyle(id, {
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
    mutateMeshPointsVertexStyle,
    setMeshPointsVertexAttributeStoredConfig,
  };
}
export {
  useMeshPointsVertexAttributeConfig,
  useMeshPointsVertexAttributeConfigValues,
  useMeshPointsVertexAttributeConfigWriter,
};
