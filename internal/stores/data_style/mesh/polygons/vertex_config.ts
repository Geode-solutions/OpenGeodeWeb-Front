import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";

interface UseMeshPolygonsVertexAttributeConfigReturn {
  meshPolygonsVertexAttribute: (meshId: MeshId) => AttributeState;
  meshPolygonsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsVertexAttributeLastItem: (meshId: MeshId, name: AttributeName | undefined) => number;
  meshPolygonsVertexAttributeItem: (meshId: MeshId) => number;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolygonsVertexAttributeConfigWriterReturn {
  mutateMeshPolygonsVertexStyle: (
    meshId: MeshId,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolygonsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolygonsVertexAttributeConfig(): UseMeshPolygonsVertexAttributeConfigReturn {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsVertexAttribute(meshId: MeshId): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPolygonsCommonStyle.meshPolygonsColoring(meshId).vertex as AttributeState;
  }
  function meshPolygonsVertexAttributeStoredConfig(
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    const itemConfig = item === undefined ? undefined : nameConfig?.[item];
    if (itemConfig !== undefined) {
      return itemConfig;
    }
    return defaultAttributeStoredConfig();
  }
  function meshPolygonsVertexAttributeName(meshId: MeshId): AttributeName | undefined {
    return meshPolygonsVertexAttribute(meshId).name;
  }
  function meshPolygonsVertexAttributeLastItem(
    meshId: MeshId,
    name: AttributeName | undefined,
  ): number {
    const { storedConfigs } = meshPolygonsVertexAttribute(meshId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolygonsVertexAttributeItem(meshId: MeshId): number {
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
  meshPolygonsVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolygonsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
}

function useMeshPolygonsVertexAttributeConfigValues(): UseMeshPolygonsVertexAttributeConfigValuesReturn {
  const {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  } = useMeshPolygonsVertexAttributeConfig();
  function meshPolygonsVertexAttributeRange(
    meshId: MeshId,
  ): [number | undefined, number | undefined] {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolygonsVertexAttributeColorMap(meshId: MeshId): string | undefined {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    return storedConfig.colorMap;
  }
  function meshPolygonsVertexAttributeNoDataColor(meshId: MeshId): RGBAColor {
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
    meshId: MeshId,
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
    meshId: MeshId,
    name: AttributeName | undefined,
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
