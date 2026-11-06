import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraVertexAttributeConfigReturn {
  meshPolyhedraVertexAttribute: (meshId: MeshId) => AttributeState;
  meshPolyhedraVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolyhedraVertexAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshPolyhedraVertexAttributeItem: (meshId: MeshId) => number;
  meshPolyhedraVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraVertexAttributeConfigWriterReturn {
  mutateMeshPolyhedraVertexStyle: (
    meshId: MeshId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolyhedraVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolyhedraVertexAttributeConfig(): UseMeshPolyhedraVertexAttributeConfigReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraVertexAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(meshId).vertex as AttributeState;
  }
  function meshPolyhedraVertexAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshPolyhedraVertexAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshPolyhedraVertexAttribute(meshId).name;
  }
  function meshPolyhedraVertexAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshPolyhedraVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolyhedraVertexAttributeItem(meshId: MeshId): number {
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
  meshPolyhedraVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolyhedraVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshPolyhedraVertexAttributeConfigValues(): UseMeshPolyhedraVertexAttributeConfigValuesReturn {
  const {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  } = useMeshPolyhedraVertexAttributeConfig();
  function meshPolyhedraVertexAttributeRange(
    meshId: MeshId,
  ): [number | undefined, number | undefined] {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraVertexAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraVertexAttributeNoDataColor(meshId: MeshId): RGBAColor {
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
    meshId: MeshId,
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
    meshId: MeshId,
    name: AttributeName | undefined,
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
