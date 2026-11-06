import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { AttributeState } from "./cell_attribute";
import type { AttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_types";

// Local imports
import { useMeshCellsCommonStyle } from "./common";

interface UseMeshCellsCellAttributeConfigReturn {
  meshCellsCellAttribute: (id: string) => AttributeState;
  meshCellsCellAttributeName: (id: string) => string | undefined;
  meshCellsCellAttributeLastItem: (id: string, name: string | undefined) => number;
  meshCellsCellAttributeItem: (id: string) => number;
  meshCellsCellAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshCellsCellAttributeConfigWriterReturn {
  mutateMeshCellsCellStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshCellsCellAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshCellsCellAttributeConfig(): UseMeshCellsCellAttributeConfigReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsCellAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.cell shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(id).cell as AttributeState;
  }
  function meshCellsCellAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsCellAttribute(id);
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
  function meshCellsCellAttributeName(id: string): string | undefined {
    return meshCellsCellAttribute(id).name;
  }
  function meshCellsCellAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshCellsCellAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshCellsCellAttributeItem(id: string): number {
    const { item, name } = meshCellsCellAttribute(id);
    return item ?? meshCellsCellAttributeLastItem(id, name);
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
  meshCellsCellAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshCellsCellAttributeColorMap: (id: string) => string | undefined;
  meshCellsCellAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshCellsCellAttributeConfigValues(): UseMeshCellsCellAttributeConfigValuesReturn {
  const {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeStoredConfig,
  } = useMeshCellsCellAttributeConfig();
  function meshCellsCellAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshCellsCellAttributeColorMap(id: string): string | undefined {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshCellsCellAttributeNoDataColor(id: string): RGBAColor {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
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
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        cell: values,
      },
    });
    return result;
  }
  async function setMeshCellsCellAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshCellsCellStyle(id, {
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
