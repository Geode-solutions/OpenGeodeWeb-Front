import type { AttributeState, AttributeStoredConfig } from "./vertex_attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshCellsCommonStyle } from "./common";

interface UseMeshCellsVertexAttributeConfigReturn {
  meshCellsVertexAttribute: (meshId: DataId) => AttributeState;
  meshCellsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshCellsVertexAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshCellsVertexAttributeItem: (meshId: DataId) => number;
  meshCellsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshCellsVertexAttributeConfigWriterReturn {
  mutateMeshCellsVertexStyle: (meshId: DataId, values: Record<string, unknown>) => Promise<string>;
  setMeshCellsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshCellsVertexAttributeConfig(): UseMeshCellsVertexAttributeConfigReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsVertexAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(meshId).vertex as AttributeState;
  }
  function meshCellsVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsVertexAttribute(meshId);
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
  function meshCellsVertexAttributeName(meshId: DataId): string | undefined {
    return meshCellsVertexAttribute(meshId).name;
  }
  function meshCellsVertexAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshCellsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshCellsVertexAttributeItem(meshId: DataId): number {
    const { item, name } = meshCellsVertexAttribute(meshId);
    return item ?? meshCellsVertexAttributeLastItem(meshId, name);
  }
  return {
    meshCellsVertexAttribute,
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeLastItem,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeStoredConfig,
  };
}

interface UseMeshCellsVertexAttributeConfigValuesReturn {
  meshCellsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshCellsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshCellsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshCellsVertexAttributeConfigValues(): UseMeshCellsVertexAttributeConfigValuesReturn {
  const {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeStoredConfig,
  } = useMeshCellsVertexAttributeConfig();
  function meshCellsVertexAttributeRange(meshId: DataId): [number | undefined, number | undefined] {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    const storedConfig = meshCellsVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshCellsVertexAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    const storedConfig = meshCellsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshCellsVertexAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    const storedConfig = meshCellsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeNoDataColor,
  };
}

function useMeshCellsVertexAttributeConfigWriter(): UseMeshCellsVertexAttributeConfigWriterReturn {
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  async function mutateMeshCellsVertexStyle(
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshCellsCommonStyle.mutateMeshCellsStyle(meshId, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshCellsVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshCellsVertexStyle(meshId, {
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
    mutateMeshCellsVertexStyle,
    setMeshCellsVertexAttributeStoredConfig,
  };
}
export {
  useMeshCellsVertexAttributeConfig,
  useMeshCellsVertexAttributeConfigValues,
  useMeshCellsVertexAttributeConfigWriter,
};
