import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

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

function isMeshPointsVertexAttributeValid({
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
function useMeshPointsVertexAttributeStyle(): {
  meshPointsVertexAttributeName: (id: string) => string | undefined;
  meshPointsVertexAttributeItem: (id: string) => number;
  meshPointsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPointsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPointsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (id: string, name: string) => Promise<unknown> | undefined;
  setMeshPointsVertexAttributeItem: (id: string, item: number) => Promise<unknown> | undefined;
  setMeshPointsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown> | undefined;
  setMeshPointsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown> | undefined;
  meshPointsVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshPointsVertexAttributeNoDataColor: (id: string, no_data_color: unknown) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  function meshPointsVertexAttribute(id: string): AttributeState {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex as AttributeState;
  }
  function meshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (
      storedConfigs &&
      name !== undefined &&
      name in storedConfigs &&
      item !== undefined &&
      item in storedConfigs[name]
    ) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  function mutateMeshPointsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): ReturnType<typeof meshPointsCommonStyle.mutateMeshPointsStyle> {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }
  function setMeshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): ReturnType<typeof mutateMeshPointsVertexStyle> {
    return mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshPointsVertexAttributeName(id: string): string | undefined {
    return meshPointsVertexAttribute(id).name;
  }
  function meshPointsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }
  function meshPointsVertexAttributeItem(id: string): number {
    const { item, name } = meshPointsVertexAttribute(id);
    return item ?? meshPointsVertexAttributeLastItem(id, name);
  }
  function setMeshPointsVertexAttribute(
    id: string,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPointsVertexAttributeSchemas.attribute;
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
  function applyVertexAttribute(id: string): Promise<unknown> | undefined {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPointsVertexAttributeValid(attribute)) {
      return setMeshPointsVertexAttribute(id, attribute);
    }
  }
  function setMeshPointsVertexAttributeName(
    id: string,
    name: string,
  ): ReturnType<typeof applyVertexAttribute> {
    const item = meshPointsVertexAttributeLastItem(id, name);
    mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  function setMeshPointsVertexAttributeItem(
    id: string,
    item: number,
  ): ReturnType<typeof applyVertexAttribute> {
    mutateMeshPointsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshPointsVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshPointsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): ReturnType<typeof applyVertexAttribute> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshPointsVertexAttributeColorMap(id: string): string | undefined {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshPointsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): ReturnType<typeof applyVertexAttribute> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPointsVertexAttributeNoDataColor(id: string): unknown {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPointsVertexAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<Awaited<ReturnType<typeof applyVertexAttribute>>> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttribute,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeItem,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeNoDataColor,
    setMeshPointsVertexAttributeNoDataColor,
  };
}
export { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle };
