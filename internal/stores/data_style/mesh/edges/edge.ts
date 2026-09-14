import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: unknown;
}

interface AttributeState {
  name?: string;
  item?: number;
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

interface AttributeInput {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color?: unknown;
}

function isMeshEdgesEdgeAttributeValid({
  name,
  item,
  minimum,
  maximum,
  colorMap,
}: AttributeInput): boolean {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesColoring(id: string): StyleValues {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring as StyleValues;
  }
  function meshEdgesEdgeAttribute(id: string): AttributeState {
    return meshEdgesColoring(id).edge as AttributeState;
  }
  function meshEdgesEdgeAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (
      storedConfigs &&
      name !== undefined &&
      name in storedConfigs &&
      item !== undefined &&
      item in storedConfigs[name]!
    ) {
      return storedConfigs[name]![item]!;
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  function mutateMeshEdgesEdgeStyle(id: string, values: Record<string, unknown>) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
  }
  function setMeshEdgesEdgeAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateMeshEdgesEdgeStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshEdgesEdgeAttributeName(id: string): string | undefined {
    return meshEdgesEdgeAttribute(id).name;
  }
  function meshEdgesEdgeAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function meshEdgesEdgeAttributeItem(id: string): number {
    const { item, name } = meshEdgesEdgeAttribute(id);
    return item ?? meshEdgesEdgeAttributeLastItem(id, name);
  }
  function setMeshEdgesEdgeAttribute(
    id: string,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ) {
    mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const schema = meshEdgesEdgeAttributeSchemas.attribute;
    const params = {
      id,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema,
      params,
    });
  }
  function applyEdgeAttribute(id: string) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshEdgesEdgeAttributeValid(attribute)) {
      return setMeshEdgesEdgeAttribute(id, attribute);
    }
  }
  function setMeshEdgesEdgeAttributeName(id: string, name: string) {
    const item = meshEdgesEdgeAttributeLastItem(id, name);
    mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    return applyEdgeAttribute(id);
  }
  function setMeshEdgesEdgeAttributeItem(id: string, item: number) {
    mutateMeshEdgesEdgeStyle(id, {
      item,
    });
    return applyEdgeAttribute(id);
  }
  function meshEdgesEdgeAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshEdgesEdgeAttributeRange(id: string, minimum: number, maximum: number) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(id);
  }
  function meshEdgesEdgeAttributeColorMap(id: string): string | undefined {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshEdgesEdgeAttributeColorMap(id: string, colorMap: string | undefined) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(id);
  }
  function meshEdgesEdgeAttributeNoDataColor(id: string): unknown {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshEdgesEdgeAttributeNoDataColor(id: string, no_data_color: unknown) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyEdgeAttribute(id);
  }
  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeItem,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeNoDataColor,
    setMeshEdgesEdgeAttributeNoDataColor,
  };
}
export { isMeshEdgesEdgeAttributeValid, useMeshEdgesEdgeAttributeStyle };
