import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

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

function isMeshPolygonsPolygonAttributeValid({
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
function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  function meshPolygonsColoring(id: string): StyleValues {
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).coloring as StyleValues;
  }
  function meshPolygonsPolygonAttribute(id: string): AttributeState {
    return meshPolygonsColoring(id).polygon as AttributeState;
  }
  function meshPolygonsPolygonAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
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
  function mutateMeshPolygonsPolygonStyle(id: string, values: Record<string, unknown>) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        polygon: values,
      },
    });
  }
  function setMeshPolygonsPolygonAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateMeshPolygonsPolygonStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshPolygonsPolygonAttributeName(id: string): string | undefined {
    return meshPolygonsPolygonAttribute(id).name;
  }
  function meshPolygonsPolygonAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function meshPolygonsPolygonAttributeItem(id: string): number {
    const { item, name } = meshPolygonsPolygonAttribute(id);
    return item ?? meshPolygonsPolygonAttributeLastItem(id, name);
  }
  function setMeshPolygonsPolygonAttribute(
    id: string,
    { name, item, minimum, maximum, colorMap, no_data_color = DEFAULT_NO_DATA_COLOR }: AttributeInput,
  ) {
    mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const schema = meshPolygonsPolygonAttributeSchemas.attribute;
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
  function applyPolygonAttribute(id: string) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsPolygonAttributeValid(attribute)) {
      return setMeshPolygonsPolygonAttribute(id, attribute);
    }
  }
  function setMeshPolygonsPolygonAttributeName(id: string, name: string) {
    const item = meshPolygonsPolygonAttributeLastItem(id, name);
    mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    return applyPolygonAttribute(id);
  }
  function setMeshPolygonsPolygonAttributeItem(id: string, item: number) {
    mutateMeshPolygonsPolygonStyle(id, {
      item,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshPolygonsPolygonAttributeRange(id: string, minimum: number, maximum: number) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeColorMap(id: string): string | undefined {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshPolygonsPolygonAttributeColorMap(id: string, colorMap: string | undefined) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyPolygonAttribute(id);
  }
  function meshPolygonsPolygonAttributeNoDataColor(id: string): unknown {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolygonsPolygonAttributeNoDataColor(id: string, no_data_color: unknown) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolygonAttribute(id);
  }
  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
    setMeshPolygonsPolygonAttributeNoDataColor,
  };
}
export { isMeshPolygonsPolygonAttributeValid, useMeshPolygonsPolygonAttributeStyle };
