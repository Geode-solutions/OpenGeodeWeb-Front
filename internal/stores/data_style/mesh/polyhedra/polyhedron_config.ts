import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";

interface UseMeshPolyhedraPolyhedronAttributeConfigReturn {
  meshPolyhedraPolyhedronAttribute: (id: string) => AttributeState;
  meshPolyhedraPolyhedronAttributeName: (id: string) => string | undefined;
  meshPolyhedraPolyhedronAttributeLastItem: (id: string, name: string | undefined) => number;
  meshPolyhedraPolyhedronAttributeItem: (id: string) => number;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshPolyhedraPolyhedronAttributeConfigWriterReturn {
  mutateMeshPolyhedraPolyhedronStyle: (
    id: string,
    values: Record<string, unknown>,
  ) => Promise<string>;
  setMeshPolyhedraPolyhedronAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshPolyhedraPolyhedronAttributeConfig(): UseMeshPolyhedraPolyhedronAttributeConfigReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraPolyhedronAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.polyhedron shape is defined by the data style schema.
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).polyhedron as AttributeState;
  }
  function meshPolyhedraPolyhedronAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
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
  function meshPolyhedraPolyhedronAttributeName(id: string): string | undefined {
    return meshPolyhedraPolyhedronAttribute(id).name;
  }
  function meshPolyhedraPolyhedronAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPolyhedraPolyhedronAttributeItem(id: string): number {
    const { item, name } = meshPolyhedraPolyhedronAttribute(id);
    return item ?? meshPolyhedraPolyhedronAttributeLastItem(id, name);
  }
  return {
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeLastItem,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  };
}

interface UseMeshPolyhedraPolyhedronAttributeConfigValuesReturn {
  meshPolyhedraPolyhedronAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolyhedraPolyhedronAttributeColorMap: (id: string) => string | undefined;
  meshPolyhedraPolyhedronAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshPolyhedraPolyhedronAttributeConfigValues(): UseMeshPolyhedraPolyhedronAttributeConfigValuesReturn {
  const {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  } = useMeshPolyhedraPolyhedronAttributeConfig();
  function meshPolyhedraPolyhedronAttributeRange(
    id: string,
  ): [number | undefined, number | undefined] {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshPolyhedraPolyhedronAttributeColorMap(id: string): string | undefined {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshPolyhedraPolyhedronAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeNoDataColor,
  };
}

function useMeshPolyhedraPolyhedronAttributeConfigWriter(): UseMeshPolyhedraPolyhedronAttributeConfigWriterReturn {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  async function mutateMeshPolyhedraPolyhedronStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
    return result;
  }
  async function setMeshPolyhedraPolyhedronAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPolyhedraPolyhedronStyle(id, {
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
    mutateMeshPolyhedraPolyhedronStyle,
    setMeshPolyhedraPolyhedronAttributeStoredConfig,
  };
}
export {
  useMeshPolyhedraPolyhedronAttributeConfig,
  useMeshPolyhedraPolyhedronAttributeConfigValues,
  useMeshPolyhedraPolyhedronAttributeConfigWriter,
};
