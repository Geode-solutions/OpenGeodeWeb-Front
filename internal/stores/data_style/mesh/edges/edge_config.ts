import type { AttributeState, AttributeStoredConfig } from "./edge_attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";

interface UseMeshEdgesEdgeAttributeConfigReturn {
  meshEdgesEdgeAttribute: (id: string) => AttributeState;
  meshEdgesEdgeAttributeName: (id: string) => string | undefined;
  meshEdgesEdgeAttributeLastItem: (id: string, name: string | undefined) => number;
  meshEdgesEdgeAttributeItem: (id: string) => number;
  meshEdgesEdgeAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
}

interface UseMeshEdgesEdgeAttributeConfigWriterReturn {
  mutateMeshEdgesEdgeStyle: (id: string, values: Record<string, unknown>) => Promise<string>;
  setMeshEdgesEdgeAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) => Promise<string>;
}

function useMeshEdgesEdgeAttributeConfig(): UseMeshEdgesEdgeAttributeConfigReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesEdgeAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.edge shape is defined by the data style schema.
    return meshEdgesCommonStyle.meshEdgesColoring(id).edge as AttributeState;
  }
  function meshEdgesEdgeAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
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
  function meshEdgesEdgeAttributeName(id: string): string | undefined {
    return meshEdgesEdgeAttribute(id).name;
  }
  function meshEdgesEdgeAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshEdgesEdgeAttributeItem(id: string): number {
    const { item, name } = meshEdgesEdgeAttribute(id);
    return item ?? meshEdgesEdgeAttributeLastItem(id, name);
  }
  return {
    meshEdgesEdgeAttribute,
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeLastItem,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  };
}

interface UseMeshEdgesEdgeAttributeConfigValuesReturn {
  meshEdgesEdgeAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeColorMap: (id: string) => string | undefined;
  meshEdgesEdgeAttributeNoDataColor: (id: string) => RGBAColor;
}

function useMeshEdgesEdgeAttributeConfigValues(): UseMeshEdgesEdgeAttributeConfigValuesReturn {
  const {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  } = useMeshEdgesEdgeAttributeConfig();
  function meshEdgesEdgeAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function meshEdgesEdgeAttributeColorMap(id: string): string | undefined {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function meshEdgesEdgeAttributeNoDataColor(id: string): RGBAColor {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  return {
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeNoDataColor,
  };
}

function useMeshEdgesEdgeAttributeConfigWriter(): UseMeshEdgesEdgeAttributeConfigWriterReturn {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  async function mutateMeshEdgesEdgeStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
    return result;
  }
  async function setMeshEdgesEdgeAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshEdgesEdgeStyle(id, {
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
    mutateMeshEdgesEdgeStyle,
    setMeshEdgesEdgeAttributeStoredConfig,
  };
}
export {
  useMeshEdgesEdgeAttributeConfig,
  useMeshEdgesEdgeAttributeConfigValues,
  useMeshEdgesEdgeAttributeConfigWriter,
};
