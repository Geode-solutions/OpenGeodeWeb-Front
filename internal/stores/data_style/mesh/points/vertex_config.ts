import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPointsCommonStyle } from "./common";

interface UseMeshPointsVertexAttributeConfigReturn {
  meshPointsVertexAttribute: (meshId: MeshId) => AttributeState;
  meshPointsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPointsVertexAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshPointsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPointsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPointsVertexAttributeConfigWriterReturn {
  mutateMeshPointsVertexStyle: (meshId: MeshId, values: Record<string, unknown>) => Promise<string>;
  setMeshPointsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPointsVertexAttributeConfig(): UseMeshPointsVertexAttributeConfigReturn {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  function meshPointsVertexAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(meshId).vertex as AttributeState;
  }
  function meshPointsVertexAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPointsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshPointsVertexAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshPointsVertexAttribute(meshId).name;
  }
  function meshPointsVertexAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshPointsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPointsVertexAttributeItem(meshId: MeshId): AttributeItem {
    const { item, name } = meshPointsVertexAttribute(meshId);
    return item ?? meshPointsVertexAttributeLastItem(meshId, name);
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
  meshPointsVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPointsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPointsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshPointsVertexAttributeConfigValues(): UseMeshPointsVertexAttributeConfigValuesReturn {
  const {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeStoredConfig,
  } = useMeshPointsVertexAttributeConfig();
  function meshPointsVertexAttributeRange(
    meshId: MeshId,
  ): [number | undefined, number | undefined] {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPointsVertexAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPointsVertexAttributeNoDataColor(meshId: MeshId): RGBAColor {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
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
    meshId: MeshId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPointsCommonStyle.mutateMeshPointsStyle(meshId, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPointsVertexAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPointsVertexStyle(meshId, {
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
