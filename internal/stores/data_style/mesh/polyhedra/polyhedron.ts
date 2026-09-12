import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import type { StyleValues } from "../../types";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron;

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

function isMeshPolyhedraPolyhedronAttributeValid({
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
function useMeshPolyhedraPolyhedronAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  function meshPolyhedraColoring(id: string): StyleValues {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).coloring as StyleValues;
  }
  function meshPolyhedraPolyhedronAttribute(id: string): AttributeState {
    return meshPolyhedraColoring(id).polyhedron as AttributeState;
  }
  function meshPolyhedraPolyhedronAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
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
  function mutateMeshPolyhedraPolyhedronStyle(id: string, values: Record<string, unknown>) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
  }
  function setMeshPolyhedraPolyhedronAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateMeshPolyhedraPolyhedronStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshPolyhedraPolyhedronAttributeName(id: string): string | undefined {
    return meshPolyhedraPolyhedronAttribute(id).name;
  }
  function meshPolyhedraPolyhedronAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function meshPolyhedraPolyhedronAttributeItem(id: string): number {
    const { item, name } = meshPolyhedraPolyhedronAttribute(id);
    return item ?? meshPolyhedraPolyhedronAttributeLastItem(id, name);
  }
  function setMeshPolyhedraPolyhedronAttribute(
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
    mutateMeshPolyhedraPolyhedronStyle(id, {
      name,
      item,
    });
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const schema = meshPolyhedraPolyhedronAttributeSchemas.attribute;
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
  function applyPolyhedronAttribute(id: string) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolyhedraPolyhedronAttributeValid(attribute)) {
      return setMeshPolyhedraPolyhedronAttribute(id, attribute);
    }
  }
  function setMeshPolyhedraPolyhedronAttributeName(id: string, name: string) {
    const item = meshPolyhedraPolyhedronAttributeLastItem(id, name);
    mutateMeshPolyhedraPolyhedronStyle(id, {
      name,
      item,
    });
    return applyPolyhedronAttribute(id);
  }
  function setMeshPolyhedraPolyhedronAttributeItem(id: string, item: number) {
    mutateMeshPolyhedraPolyhedronStyle(id, {
      item,
    });
    return applyPolyhedronAttribute(id);
  }
  function meshPolyhedraPolyhedronAttributeRange(
    id: string,
  ): [number | undefined, number | undefined] {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id: string, minimum: number, maximum: number) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(id);
  }
  function meshPolyhedraPolyhedronAttributeColorMap(id: string): string | undefined {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshPolyhedraPolyhedronAttributeColorMap(id: string, colorMap: string | undefined) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyPolyhedronAttribute(id);
  }
  function meshPolyhedraPolyhedronAttributeNoDataColor(id: string): unknown {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPolyhedraPolyhedronAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolyhedronAttribute(id);
  }
  return {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeItem,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeNoDataColor,
    setMeshPolyhedraPolyhedronAttributeNoDataColor,
  };
}
export { isMeshPolyhedraPolyhedronAttributeValid, useMeshPolyhedraPolyhedronAttributeStyle };
