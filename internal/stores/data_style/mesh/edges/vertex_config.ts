import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesVertexAttributeConfigReturn {
  meshEdgesVertexAttribute: (meshId: MeshId) => AttributeState;
  meshEdgesVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesVertexAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshEdgesVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesVertexAttributeConfigWriterReturn {
  mutateMeshEdgesVertexStyle: (meshId: MeshId, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesVertexAttributeConfig(): UseMeshEdgesVertexAttributeConfigReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesVertexAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).vertex as AttributeState;
  }
  function meshEdgesVertexAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshEdgesVertexAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshEdgesVertexAttribute(meshId).name;
  }
  function meshEdgesVertexAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshEdgesVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesVertexAttributeItem(meshId: MeshId): AttributeItem {
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
  meshEdgesVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshEdgesVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshEdgesVertexAttributeConfigValues(): UseMeshEdgesVertexAttributeConfigValuesReturn {
  const {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeStoredConfig,
  } = useMeshEdgesVertexAttributeConfig();
  function meshEdgesVertexAttributeRange(meshId: MeshId): [number | undefined, number | undefined] {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesVertexAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesVertexAttributeNoDataColor(meshId: MeshId): RGBAColor {
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
    meshId: MeshId,
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
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
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
