import type { AttributeState, AttributeStoredConfig } from "./vertex_attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshPointsCommonStyle } from "./common";

interface UseMeshPointsVertexAttributeConfigReturn {
  meshPointsVertexAttribute: (meshId: DataId) => AttributeState;
  meshPointsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPointsVertexAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshPointsVertexAttributeItem: (meshId: DataId) => number;
  meshPointsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPointsVertexAttributeConfigWriterReturn {
  mutateMeshPointsVertexStyle: (meshId: DataId, values: Record<string, unknown>) => Promise<string>;
  setMeshPointsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPointsVertexAttributeConfig(): UseMeshPointsVertexAttributeConfigReturn {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  function meshPointsVertexAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(meshId).vertex as AttributeState;
  }
  function meshPointsVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPointsVertexAttribute(meshId);
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
  function meshPointsVertexAttributeName(meshId: DataId): string | undefined {
    return meshPointsVertexAttribute(meshId).name;
  }
  function meshPointsVertexAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshPointsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPointsVertexAttributeItem(meshId: DataId): number {
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
  meshPointsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPointsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPointsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshPointsVertexAttributeConfigValues(): UseMeshPointsVertexAttributeConfigValuesReturn {
  const {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeStoredConfig,
  } = useMeshPointsVertexAttributeConfig();
  function meshPointsVertexAttributeRange(
    meshId: DataId,
  ): [number | undefined, number | undefined] {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPointsVertexAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPointsVertexAttributeNoDataColor(meshId: DataId): RGBAColor {
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
    meshId: DataId,
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
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
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
