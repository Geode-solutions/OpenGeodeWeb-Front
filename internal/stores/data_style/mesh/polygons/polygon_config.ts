import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsPolygonAttributeConfigReturn {
  meshPolygonsPolygonAttribute: (meshId: DataId) => AttributeState;
  meshPolygonsPolygonAttributeName: (meshId: DataId) => string | undefined;
  meshPolygonsPolygonAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshPolygonsPolygonAttributeItem: (meshId: DataId) => number;
  meshPolygonsPolygonAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsPolygonAttributeConfigWriterReturn {
  mutateMeshPolygonsPolygonStyle: (
    meshId: DataId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolygonsPolygonAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolygonsPolygonAttributeConfig(): UseMeshPolygonsPolygonAttributeConfigReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsPolygonAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).polygon as AttributeState;
  }
  function meshPolygonsPolygonAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsPolygonAttribute(meshId);
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
  function meshPolygonsPolygonAttributeName(meshId: DataId): string | undefined {
    return meshPolygonsPolygonAttribute(meshId).name;
  }
  function meshPolygonsPolygonAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshPolygonsPolygonAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsPolygonAttributeItem(meshId: DataId): number {
    const { item, name } = meshPolygonsPolygonAttribute(meshId);
    return item ?? meshPolygonsPolygonAttributeLastItem(meshId, name);
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
  meshPolygonsPolygonAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshPolygonsPolygonAttributeConfigValues(): UseMeshPolygonsPolygonAttributeConfigValuesReturn {
  const {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  } = useMeshPolygonsPolygonAttributeConfig();
  function meshPolygonsPolygonAttributeRange(
    meshId: DataId,
  ): [number | undefined, number | undefined] {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsPolygonAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsPolygonAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
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
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(meshId, values);
    return result;
  }
  async function setMeshPolygonsPolygonAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolygonsPolygonStyle(meshId, {
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
