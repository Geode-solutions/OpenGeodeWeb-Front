import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshCellsCommonStyle } from "./common";

interface UseMeshCellsCellAttributeConfigReturn {
  meshCellsCellAttribute: (meshId: DataId) => AttributeState;
  meshCellsCellAttributeName: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshCellsCellAttributeItem: (meshId: DataId) => number;
  meshCellsCellAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshCellsCellAttributeConfigWriterReturn {
  mutateMeshCellsCellStyle: (meshId: DataId, values: Record<string, unknown>) => Promise<string>;
  setMeshCellsCellAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshCellsCellAttributeConfig(): UseMeshCellsCellAttributeConfigReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsCellAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.cell shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(meshId).cell as AttributeState;
  }
  function meshCellsCellAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsCellAttribute(meshId);
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
  function meshCellsCellAttributeName(meshId: DataId): string | undefined {
    return meshCellsCellAttribute(meshId).name;
  }
  function meshCellsCellAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshCellsCellAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshCellsCellAttributeItem(meshId: DataId): number {
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
  meshCellsCellAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshCellsCellAttributeColorMap: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshCellsCellAttributeConfigValues(): UseMeshCellsCellAttributeConfigValuesReturn {
  const {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeStoredConfig,
  } = useMeshCellsCellAttributeConfig();
  function meshCellsCellAttributeRange(meshId: DataId): [number | undefined, number | undefined] {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshCellsCellAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshCellsCellAttributeNoDataColor(meshId: DataId): RGBAColor {
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
    meshId: DataId,
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
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
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
