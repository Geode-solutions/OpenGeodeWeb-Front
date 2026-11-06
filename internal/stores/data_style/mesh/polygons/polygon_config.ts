import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsPolygonAttributeConfigReturn {
  meshPolygonsPolygonAttribute: (id: string) => AttributeState;
  meshPolygonsPolygonAttributeName: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeLastItem: (id: string, name: string | undefined) => number;
  meshPolygonsPolygonAttributeItem: (id: string) => number;
  meshPolygonsPolygonAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsPolygonAttributeConfigWriterReturn {
  mutateMeshPolygonsPolygonStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshPolygonsPolygonAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolygonsPolygonAttributeConfig(): UseMeshPolygonsPolygonAttributeConfigReturn {
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
  return {
    meshPolygonsPolygonAttribute,
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeLastItem,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  };
}

interface UseMeshPolygonsPolygonAttributeConfigValuesReturn {
  meshPolygonsPolygonAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshPolygonsPolygonAttributeConfigValues(): UseMeshPolygonsPolygonAttributeConfigValuesReturn {
  const {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  } = useMeshPolygonsPolygonAttributeConfig();
  function meshPolygonsPolygonAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsPolygonAttributeColorMap(id: string): string | undefined {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsPolygonAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
  };
}

function useMeshPolygonsPolygonAttributeConfigWriter(): UseMeshPolygonsPolygonAttributeConfigWriterReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
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
  return {
    mutateMeshPolygonsPolygonStyle,
    setMeshPolygonsPolygonAttributeStoredConfig,
  };
}
export {
  useMeshPolygonsPolygonAttributeConfig,
  useMeshPolygonsPolygonAttributeConfigValues,
  useMeshPolygonsPolygonAttributeConfigWriter,
};
