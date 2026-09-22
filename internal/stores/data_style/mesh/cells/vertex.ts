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
  setMeshCellsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshCellsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshCellsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsVertexAttributeNoDataColor: (id: string) => unknown;
  setMeshCellsVertexAttributeNoDataColor: (id: string, no_data_color: unknown) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsVertexAttributeStyle(): UseMeshCellsVertexAttributeStyleReturn {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshCellsCommonStyle.meshCellsColoring(id).vertex as AttributeState;
  }
  function meshCellsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsVertexAttribute(id);
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
  async function mutateMeshCellsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshCellsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshCellsVertexStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshCellsVertexAttributeName(id: string): string | undefined {
    return meshCellsVertexAttribute(id).name;
  }
  function meshCellsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
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
    await mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
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
  async function applyVertexAttribute(id: string): Promise<unknown> {
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
      const result = await setMeshCellsVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshCellsVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshCellsVertexAttributeLastItem(id, name);
    await mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshCellsVertexStyle(id, {
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
  async function setMeshCellsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
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
  async function setMeshCellsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
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
