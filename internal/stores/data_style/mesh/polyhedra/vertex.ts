import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

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

function isMeshPolyhedraVertexAttributeValid({
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
function useMeshPolyhedraVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraColoring(id: string): StyleValues {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).coloring as StyleValues;
  }
  function meshPolyhedraVertexAttribute(id: string): AttributeState {
    return meshPolyhedraColoring(id).vertex as AttributeState;
  }
  function meshPolyhedraVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
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
  function mutateMeshPolyhedraVertexStyle(id: string, values: Record<string, unknown>) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }
  function setMeshPolyhedraVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshPolyhedraVertexAttributeName(id: string): string | undefined {
    return meshPolyhedraVertexAttribute(id).name;
  }
  function meshPolyhedraVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function meshPolyhedraVertexAttributeItem(id: string): number {
    const { item, name } = meshPolyhedraVertexAttribute(id);
    return item ?? meshPolyhedraVertexAttributeLastItem(id, name);
  }
  function setMeshPolyhedraVertexAttribute(
    id: string,
    { name, item, minimum, maximum, colorMap, no_data_color = DEFAULT_NO_DATA_COLOR }: AttributeInput,
  ) {
    mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const schema = meshPolyhedraVertexAttributeSchemas.attribute;
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
  function applyVertexAttribute(id: string) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolyhedraVertexAttributeValid(attribute)) {
      return setMeshPolyhedraVertexAttribute(id, attribute);
    }
  }
  function setMeshPolyhedraVertexAttributeName(id: string, name: string) {
    const item = meshPolyhedraVertexAttributeLastItem(id, name);
    mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  function setMeshPolyhedraVertexAttributeItem(id: string, item: number) {
    mutateMeshPolyhedraVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshPolyhedraVertexAttributeRange(id: string, minimum: number, maximum: number) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshPolyhedraVertexAttributeColorMap(id: string, colorMap: string | undefined) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPolyhedraVertexAttributeNoDataColor(id: string): unknown {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolyhedraVertexAttributeNoDataColor(id: string, no_data_color: unknown) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeItem,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
    setMeshPolyhedraVertexAttributeNoDataColor,
  };
}
export { isMeshPolyhedraVertexAttributeValid, useMeshPolyhedraVertexAttributeStyle };
