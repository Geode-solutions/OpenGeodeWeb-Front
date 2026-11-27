import type { AttributeColorMap, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  ColorRGBA,
} from "@geode/opengeodeweb-viewer/schema_types";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraPolyhedronAttributeConfigReturn {
  meshPolyhedraPolyhedronAttribute: (meshId: MeshId) => AttributeState;
  meshPolyhedraPolyhedronAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolyhedraPolyhedronAttributeLastItem: (
    meshId: MeshId,
    name: AttributeName | undefined,
  ) => AttributeItem;
  meshPolyhedraPolyhedronAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraPolyhedronAttributeConfigWriterReturn {
  mutateMeshPolyhedraPolyhedronStyle: (meshId: MeshId, values: StyleValues) => Promise<MeshId>;
  setMeshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<MeshId>;
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
    item: AttributeItem,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = nameConfig?.[item];
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
  ): AttributeItem {
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
  meshPolyhedraPolyhedronAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolyhedraPolyhedronAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshPolyhedraPolyhedronAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
}

function useMeshPolyhedraPolyhedronAttributeConfigValues(): UseMeshPolyhedraPolyhedronAttributeConfigValuesReturn {
  const {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  } = useMeshPolyhedraPolyhedronAttributeConfig();
  function meshPolyhedraPolyhedronAttributeRange(meshId: MeshId): AttributeRange {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraPolyhedronAttributeColorMap(meshId: MeshId): AttributeColorMap | undefined {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraPolyhedronAttributeNoDataColor(meshId: MeshId): ColorRGBA {
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
    values: StyleValues,
  ): Promise<MeshId> {
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
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ): Promise<MeshId> {
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
