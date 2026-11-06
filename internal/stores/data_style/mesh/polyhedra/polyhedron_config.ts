import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraPolyhedronAttributeConfigReturn {
  meshPolyhedraPolyhedronAttribute: (meshId: MeshId) => AttributeState;
  meshPolyhedraPolyhedronAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolyhedraPolyhedronAttributeLastItem: (
    meshId: MeshId,
    name: AttributeName | undefined,
  ) => number;
  meshPolyhedraPolyhedronAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraPolyhedronAttributeConfigWriterReturn {
  mutateMeshPolyhedraPolyhedronStyle: (
    meshId: MeshId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolyhedraPolyhedronAttributeConfig(): UseMeshPolyhedraPolyhedronAttributeConfigReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraPolyhedronAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polyhedron shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId).polyhedron as AttributeState;
  }
  function meshPolyhedraPolyhedronAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshPolyhedraPolyhedronAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshPolyhedraPolyhedronAttribute(meshId).name;
  }
  function meshPolyhedraPolyhedronAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolyhedraPolyhedronAttributeItem(meshId: MeshId): AttributeItem {
    const { item, name } = meshPolyhedraPolyhedronAttribute(meshId);
    return item ?? meshPolyhedraPolyhedronAttributeLastItem(meshId, name);
  }
  return {
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeLastItem,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  };
}

interface UseMeshPolyhedraPolyhedronAttributeConfigValuesReturn {
  meshPolyhedraPolyhedronAttributeRange: (
    meshId: MeshId,
  ) => [number | undefined, number | undefined];
  meshPolyhedraPolyhedronAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolyhedraPolyhedronAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshPolyhedraPolyhedronAttributeConfigValues(): UseMeshPolyhedraPolyhedronAttributeConfigValuesReturn {
  const {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  } = useMeshPolyhedraPolyhedronAttributeConfig();
  function meshPolyhedraPolyhedronAttributeRange(
    meshId: MeshId,
  ): [number | undefined, number | undefined] {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraPolyhedronAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraPolyhedronAttributeNoDataColor(meshId: MeshId): RGBAColor {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeNoDataColor,
  };
}

function useMeshPolyhedraPolyhedronAttributeConfigWriter(): UseMeshPolyhedraPolyhedronAttributeConfigWriterReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  async function mutateMeshPolyhedraPolyhedronStyle(
    meshId: MeshId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(meshId, {
      coloring: {
        polyhedron: values,
      },
    });
    return result;
  }
  async function setMeshPolyhedraPolyhedronAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolyhedraPolyhedronStyle(meshId, {
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
    mutateMeshPolyhedraPolyhedronStyle,
    setMeshPolyhedraPolyhedronAttributeStoredConfig,
  };
}
export {
  useMeshPolyhedraPolyhedronAttributeConfig,
  useMeshPolyhedraPolyhedronAttributeConfigValues,
  useMeshPolyhedraPolyhedronAttributeConfigWriter,
};
