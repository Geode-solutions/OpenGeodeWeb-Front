import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex;

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

function isMeshCellsVertexAttributeValid({
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

interface UseMeshCellsVertexAttributeStyleReturn {
  meshCellsVertexAttributeName: (id: string) => string | undefined;
  meshCellsVertexAttributeItem: (id: string) => number;
  meshCellsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshCellsVertexAttributeColorMap: (id: string) => string | undefined;
  meshCellsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsVertexAttribute: (id: string, input: AttributeInput) => Promise<unknown>;
  setMeshCellsVertexAttributeName: (id: string, name: string) => Promise<unknown> | undefined;
  setMeshCellsVertexAttributeItem: (id: string, item: number) => Promise<unknown> | undefined;
  setMeshCellsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown> | undefined;
  setMeshCellsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown> | undefined;
  meshCellsVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshCellsVertexAttributeNoDataColor: (id: string, no_data_color: unknown) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsVertexAttributeStyle(): UseMeshCellsVertexAttributeStyleReturn {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsVertexAttribute(id: string): AttributeState {
    return meshCellsCommonStyle.meshCellsColoring(id).vertex as AttributeState;
  }
  function meshCellsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsVertexAttribute(id);
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
  async function mutateMeshCellsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<void> {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }
  async function setMeshCellsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    return mutateMeshCellsVertexStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshCellsVertexAttributeName(id: string): string | undefined {
    return meshCellsVertexAttribute(id).name;
  }
  function meshCellsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }
  function meshCellsVertexAttributeItem(id: string): number {
    const { item, name } = meshCellsVertexAttribute(id);
    return item ?? meshCellsVertexAttributeLastItem(id, name);
  }
  async function setMeshCellsVertexAttribute(
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
    mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshCellsVertexAttributeSchemas.attribute;
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
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshCellsVertexAttributeValid(attribute)) {
      return setMeshCellsVertexAttribute(id, attribute);
    }
  }
  function setMeshCellsVertexAttributeName(id: string, name: string): Promise<unknown> | undefined {
    const item = meshCellsVertexAttributeLastItem(id, name);
    mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  function setMeshCellsVertexAttributeItem(id: string, item: number): Promise<unknown> | undefined {
    mutateMeshCellsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshCellsVertexAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshCellsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> | undefined {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshCellsVertexAttributeColorMap(id: string): string | undefined {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshCellsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> | undefined {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshCellsVertexAttributeNoDataColor(id: string): unknown {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshCellsVertexAttributeNoDataColor(
    id: string,
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeItem,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeNoDataColor,
    setMeshCellsVertexAttributeNoDataColor,
  };
}
export { isMeshCellsVertexAttributeValid, useMeshCellsVertexAttributeStyle };
