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
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsPolygonAttributeConfigReturn {
  meshPolygonsPolygonAttribute: (meshId: MeshId) => AttributeState;
  meshPolygonsPolygonAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsPolygonAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshPolygonsPolygonAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolygonsPolygonAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsPolygonAttributeConfigWriterReturn {
  mutateMeshPolygonsPolygonStyle: (
    meshId: MeshId,
    values: Record<string, unknown>,
  ) => Promise<MeshId>;
  setMeshPolygonsPolygonAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<MeshId>;
}

function useMeshPolygonsPolygonAttributeConfig(): UseMeshPolygonsPolygonAttributeConfigReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsPolygonAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polygon shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).polygon as AttributeState;
  }
  function meshPolygonsPolygonAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsPolygonAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshPolygonsPolygonAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshPolygonsPolygonAttribute(meshId).name;
  }
  function meshPolygonsPolygonAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshPolygonsPolygonAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsPolygonAttributeItem(meshId: MeshId): AttributeItem {
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
  meshPolygonsPolygonAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolygonsPolygonAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
}

function useMeshPolygonsPolygonAttributeConfigValues(): UseMeshPolygonsPolygonAttributeConfigValuesReturn {
  const {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  } = useMeshPolygonsPolygonAttributeConfig();
  function meshPolygonsPolygonAttributeRange(meshId: MeshId): AttributeRange {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsPolygonAttributeColorMap(meshId: MeshId): AttributeColorMap | undefined {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsPolygonAttributeNoDataColor(meshId: MeshId): ColorRGBA {
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
    meshId: MeshId,
    values: Record<string, unknown>,
  ): Promise<MeshId> {
    const result = await meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(meshId, values);
    return result;
  }
  async function setMeshPolygonsPolygonAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ): Promise<MeshId> {
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
