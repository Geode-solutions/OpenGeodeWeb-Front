import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesVertexAttributeConfigReturn {
  meshEdgesVertexAttribute: (meshId: DataId) => AttributeState;
  meshEdgesVertexAttributeName: (meshId: DataId) => string | undefined;
  meshEdgesVertexAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshEdgesVertexAttributeItem: (meshId: DataId) => number;
  meshEdgesVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesVertexAttributeConfigWriterReturn {
  mutateMeshEdgesVertexStyle: (meshId: DataId, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesVertexAttributeConfig(): UseMeshEdgesVertexAttributeConfigReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesVertexAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).vertex as AttributeState;
  }
  function meshEdgesVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshEdgesVertexAttributeName(meshId: DataId): string | undefined {
    return meshEdgesVertexAttribute(meshId).name;
  }
  function meshEdgesVertexAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshEdgesVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesVertexAttributeItem(meshId: DataId): number {
    const { item, name } = meshEdgesVertexAttribute(meshId);
    return item ?? meshEdgesVertexAttributeLastItem(meshId, name);
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
  meshEdgesVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshEdgesVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshEdgesVertexAttributeConfigValues(): UseMeshEdgesVertexAttributeConfigValuesReturn {
  const {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeStoredConfig,
  } = useMeshEdgesVertexAttributeConfig();
  function meshEdgesVertexAttributeRange(meshId: DataId): [number | undefined, number | undefined] {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesVertexAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesVertexAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
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
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshEdgesCommonStyle.mutateMeshEdgesStyle(meshId, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshEdgesVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshEdgesVertexStyle(meshId, {
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
