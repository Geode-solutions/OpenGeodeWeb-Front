import type { AttributeState, AttributeStoredConfig } from "./vertex_attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsVertexAttributeConfigReturn {
  meshPolygonsVertexAttribute: (meshId: DataId) => AttributeState;
  meshPolygonsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPolygonsVertexAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshPolygonsVertexAttributeItem: (meshId: DataId) => number;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsVertexAttributeConfigWriterReturn {
  mutateMeshPolygonsVertexStyle: (
    meshId: DataId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolygonsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolygonsVertexAttributeConfig(): UseMeshPolygonsVertexAttributeConfigReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsVertexAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).vertex as AttributeState;
  }
  function meshPolygonsVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsVertexAttribute(meshId);
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
  function meshPolygonsVertexAttributeName(meshId: DataId): string | undefined {
    return meshPolygonsVertexAttribute(meshId).name;
  }
  function meshPolygonsVertexAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshPolygonsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsVertexAttributeItem(meshId: DataId): number {
    const { item, name } = meshPolygonsVertexAttribute(meshId);
    return item ?? meshPolygonsVertexAttributeLastItem(meshId, name);
  }
  return {
    meshPolygonsVertexAttribute,
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeLastItem,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  };
}

interface UseMeshPolygonsVertexAttributeConfigValuesReturn {
  meshPolygonsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolygonsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshPolygonsVertexAttributeConfigValues(): UseMeshPolygonsVertexAttributeConfigValuesReturn {
  const {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  } = useMeshPolygonsVertexAttributeConfig();
  function meshPolygonsVertexAttributeRange(
    meshId: DataId,
  ): [number | undefined, number | undefined] {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsVertexAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsVertexAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoDataColor,
  };
}

function useMeshPolygonsVertexAttributeConfigWriter(): UseMeshPolygonsVertexAttributeConfigWriterReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  async function mutateMeshPolygonsVertexStyle(
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(meshId, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPolygonsVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolygonsVertexStyle(meshId, {
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
    mutateMeshPolygonsVertexStyle,
    setMeshPolygonsVertexAttributeStoredConfig,
  };
}
export {
  useMeshPolygonsVertexAttributeConfig,
  useMeshPolygonsVertexAttributeConfigValues,
  useMeshPolygonsVertexAttributeConfigWriter,
};
