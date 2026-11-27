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
import { useMeshCellsCommonStyle } from "./common";

interface UseMeshCellsCellAttributeConfigReturn {
  meshCellsCellAttribute: (meshId: MeshId) => AttributeState;
  meshCellsCellAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshCellsCellAttributeLastItem: (
    meshId: MeshId,
    name: AttributeName | undefined,
  ) => AttributeItem;
  meshCellsCellAttributeItem: (meshId: MeshId) => AttributeItem;
  meshCellsCellAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
  ) => AttributeStoredConfig;
}

interface UseMeshCellsCellAttributeConfigWriterReturn {
  mutateMeshCellsCellStyle: (meshId: MeshId, values: StyleValues) => Promise<MeshId>;
  setMeshCellsCellAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<MeshId>;
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
    item: AttributeItem,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsCellAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshCellsCellAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshCellsCellAttribute(meshId).name;
  }
  function meshCellsCellAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): AttributeItem {
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
  meshCellsCellAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshCellsCellAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
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
  function meshCellsCellAttributeColorMap(meshId: MeshId): AttributeColorMap | undefined {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshCellsCellAttributeNoDataColor(meshId: MeshId): ColorRGBA {
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
  async function mutateMeshCellsCellStyle(meshId: MeshId, values: StyleValues): Promise<MeshId> {
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
    item: AttributeItem,
    config: Partial<AttributeStoredConfig>,
  ): Promise<MeshId> {
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
