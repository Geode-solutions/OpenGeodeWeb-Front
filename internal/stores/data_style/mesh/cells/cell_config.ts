import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshCellsCommonStyle } from "./common";

interface UseMeshCellsCellAttributeConfigReturn {
  meshCellsCellAttribute: (meshId: MeshId) => AttributeState;
  meshCellsCellAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshCellsCellAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshCellsCellAttributeItem: (meshId: MeshId) => AttributeItem;
  meshCellsCellAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshCellsCellAttributeConfigWriterReturn {
  mutateMeshCellsCellStyle: (meshId: MeshId, values: Record<string, unknown>) => Promise<string>;
  setMeshCellsCellAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshCellsCellAttributeConfig(): UseMeshCellsCellAttributeConfigReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsCellAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.cell shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(meshId).cell as AttributeState;
  }
  function meshCellsCellAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsCellAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshCellsCellAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshCellsCellAttribute(meshId).name;
  }
  function meshCellsCellAttributeLastItem(meshId: MeshId, name: AttributeName | undefined): number {
    const { storedConfigs } = meshCellsCellAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshCellsCellAttributeItem(meshId: MeshId): AttributeItem {
    const { item, name } = meshCellsCellAttribute(meshId);
    return item ?? meshCellsCellAttributeLastItem(meshId, name);
  }
  return {
    meshCellsCellAttribute,
    meshCellsCellAttributeName,
    meshCellsCellAttributeLastItem,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeStoredConfig,
  };
}

interface UseMeshCellsCellAttributeConfigValuesReturn {
  meshCellsCellAttributeRange: (meshId: MeshId) => AttributeRange;
  meshCellsCellAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshCellsCellAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshCellsCellAttributeConfigValues(): UseMeshCellsCellAttributeConfigValuesReturn {
  const {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeStoredConfig,
  } = useMeshCellsCellAttributeConfig();
  function meshCellsCellAttributeRange(meshId: MeshId): AttributeRange {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshCellsCellAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshCellsCellAttributeNoDataColor(meshId: MeshId): RGBAColor {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeNoDataColor,
  };
}

function useMeshCellsCellAttributeConfigWriter(): UseMeshCellsCellAttributeConfigWriterReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  async function mutateMeshCellsCellStyle(
    meshId: MeshId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshCellsCommonStyle.mutateMeshCellsStyle(meshId, {
      coloring: {
        cell: values,
      },
    });
    return result;
  }
  async function setMeshCellsCellAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshCellsCellStyle(meshId, {
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
    mutateMeshCellsCellStyle,
    setMeshCellsCellAttributeStoredConfig,
  };
}
export {
  useMeshCellsCellAttributeConfig,
  useMeshCellsCellAttributeConfigValues,
  useMeshCellsCellAttributeConfigWriter,
};
