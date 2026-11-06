import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraVertexAttributeConfigReturn {
  meshPolyhedraVertexAttribute: (meshId: DataId) => AttributeState;
  meshPolyhedraVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPolyhedraVertexAttributeLastItem: (meshId: DataId, name: string | undefined) => number;
  meshPolyhedraVertexAttributeItem: (meshId: DataId) => number;
  meshPolyhedraVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraVertexAttributeConfigWriterReturn {
  mutateMeshPolyhedraVertexStyle: (
    meshId: DataId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolyhedraVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolyhedraVertexAttributeConfig(): UseMeshPolyhedraVertexAttributeConfigReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraVertexAttribute(meshId: DataId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId).vertex as AttributeState;
  }
  function meshPolyhedraVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraVertexAttribute(meshId);
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
  function meshPolyhedraVertexAttributeName(meshId: DataId): string | undefined {
    return meshPolyhedraVertexAttribute(meshId).name;
  }
  function meshPolyhedraVertexAttributeLastItem(meshId: DataId, name: string | undefined): number {
    const { storedConfigs } = meshPolyhedraVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolyhedraVertexAttributeItem(meshId: DataId): number {
    const { item, name } = meshPolyhedraVertexAttribute(meshId);
    return item ?? meshPolyhedraVertexAttributeLastItem(meshId, name);
  }
  return {
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeLastItem,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  };
}

interface UseMeshPolyhedraVertexAttributeConfigValuesReturn {
  meshPolyhedraVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolyhedraVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
}

function useMeshPolyhedraVertexAttributeConfigValues(): UseMeshPolyhedraVertexAttributeConfigValuesReturn {
  const {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  } = useMeshPolyhedraVertexAttributeConfig();
  function meshPolyhedraVertexAttributeRange(
    meshId: DataId,
  ): [number | undefined, number | undefined] {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraVertexAttributeColorMap(meshId: DataId): string | undefined {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraVertexAttributeNoDataColor(meshId: DataId): RGBAColor {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
  };
}

function useMeshPolyhedraVertexAttributeConfigWriter(): UseMeshPolyhedraVertexAttributeConfigWriterReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  async function mutateMeshPolyhedraVertexStyle(
    meshId: DataId,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(meshId, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPolyhedraVertexAttributeStoredConfig(
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolyhedraVertexStyle(meshId, {
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
    mutateMeshPolyhedraVertexStyle,
    setMeshPolyhedraVertexAttributeStoredConfig,
  };
}
export {
  useMeshPolyhedraVertexAttributeConfig,
  useMeshPolyhedraVertexAttributeConfigValues,
  useMeshPolyhedraVertexAttributeConfigWriter,
};
