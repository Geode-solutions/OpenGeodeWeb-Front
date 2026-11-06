import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesEdgeAttributeConfigReturn {
  meshEdgesEdgeAttribute: (meshId: MeshId) => AttributeState;
  meshEdgesEdgeAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesEdgeAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshEdgesEdgeAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesEdgeAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesEdgeAttributeConfigWriterReturn {
  mutateMeshEdgesEdgeStyle: (meshId: MeshId, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesEdgeAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesEdgeAttributeConfig(): UseMeshEdgesEdgeAttributeConfigReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesEdgeAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.edge shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(meshId).edge as AttributeState;
  }
  function meshEdgesEdgeAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesEdgeAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshEdgesEdgeAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshEdgesEdgeAttribute(meshId).name;
  }
  function meshEdgesEdgeAttributeLastItem(meshId: MeshId, name: AttributeName | undefined): number {
    const { storedConfigs } = meshEdgesEdgeAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesEdgeAttributeItem(meshId: MeshId): AttributeItem {
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
  meshEdgesEdgeAttributeRange: (meshId: MeshId) => AttributeRange;
  meshEdgesEdgeAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshEdgesEdgeAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshEdgesEdgeAttributeConfigValues(): UseMeshEdgesEdgeAttributeConfigValuesReturn {
  const {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  } = useMeshEdgesEdgeAttributeConfig();
  function meshEdgesEdgeAttributeRange(meshId: MeshId): AttributeRange {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesEdgeAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesEdgeAttributeNoDataColor(meshId: MeshId): RGBAColor {
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
    meshId: MeshId,
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
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
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
