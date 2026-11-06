import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesEdgeAttributeConfigReturn {
  meshEdgesEdgeAttribute: (meshId: DataId) => AttributeState;
  meshEdgesEdgeAttributeName: (meshId: DataId) => string | undefined;
  meshEdgesEdgeAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshEdgesEdgeAttributeItem: (meshId: DataId) => number;
  meshEdgesEdgeAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesEdgeAttributeConfigWriterReturn {
  mutateMeshEdgesEdgeStyle: (meshId: DataId, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesEdgeAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesEdgeAttributeConfig(): UseMeshEdgesEdgeAttributeConfigReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesEdgeAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.edge shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).edge as AttributeState;
  }
  function meshEdgesEdgeAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesEdgeAttribute(meshId);
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
  function meshEdgesEdgeAttributeName(meshId: DataId): string | undefined {
    return meshEdgesEdgeAttribute(meshId).name;
  }
  function meshEdgesEdgeAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshEdgesEdgeAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesEdgeAttributeItem(meshId: DataId): number {
    const { item, name } = meshEdgesEdgeAttribute(meshId);
    return item ?? meshEdgesEdgeAttributeLastItem(meshId, name);
  }
  return {
    meshEdgesEdgeAttribute,
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeLastItem,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  };
}

interface UseMeshEdgesEdgeAttributeConfigValuesReturn {
  meshEdgesEdgeAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeColorMap: (meshId: DataId) => string | undefined;
  meshEdgesEdgeAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshEdgesEdgeAttributeConfigValues(): UseMeshEdgesEdgeAttributeConfigValuesReturn {
  const {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  } = useMeshEdgesEdgeAttributeConfig();
  function meshEdgesEdgeAttributeRange(meshId: DataId): [number | undefined, number | undefined] {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesEdgeAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesEdgeAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeNoDataColor,
  };
}

function useMeshEdgesEdgeAttributeConfigWriter(): UseMeshEdgesEdgeAttributeConfigWriterReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  async function mutateMeshEdgesEdgeStyle(
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshEdgesCommonStyle.mutateMeshEdgesStyle(meshId, {
      coloring: {
        edge: values,
      },
    });
    return result;
  }
  async function setMeshEdgesEdgeAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshEdgesEdgeStyle(meshId, {
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
    mutateMeshEdgesEdgeStyle,
    setMeshEdgesEdgeAttributeStoredConfig,
  };
}
export {
  useMeshEdgesEdgeAttributeConfig,
  useMeshEdgesEdgeAttributeConfigValues,
  useMeshEdgesEdgeAttributeConfigWriter,
};
