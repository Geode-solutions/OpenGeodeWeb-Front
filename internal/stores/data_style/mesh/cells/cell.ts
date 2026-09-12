import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsCellAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell;

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

function isMeshCellsCellAttributeValid({
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
function useMeshCellsCellAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();
  function meshCellsCellAttribute(id: string): AttributeState {
    return meshCellsCommonStyle.meshCellsColoring(id).cell as AttributeState;
  }
  function meshCellsCellAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshCellsCellAttribute(id);
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
  function mutateMeshCellsCellStyle(id: string, values: Record<string, unknown>) {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        cell: values,
      },
    });
  }
  function setMeshCellsCellAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateMeshCellsCellStyle(id, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
        },
      },
    });
  }
  function meshCellsCellAttributeName(id: string): string | undefined {
    return meshCellsCellAttribute(id).name;
  }
  function meshCellsCellAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
    }
    return 0;
  }
  function meshCellsCellAttributeItem(id: string): number {
    const { item, name } = meshCellsCellAttribute(id);
    return item ?? meshCellsCellAttributeLastItem(id, name);
  }
  function setMeshCellsCellAttribute(
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
    mutateMeshCellsCellStyle(id, {
      name,
      item,
    });
    setMeshCellsCellAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
    const schema = meshCellsCellAttributeSchemas.attribute;
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
  function applyCellAttribute(id: string) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshCellsCellAttributeValid(attribute)) {
      return setMeshCellsCellAttribute(id, attribute);
    }
  }
  function setMeshCellsCellAttributeName(id: string, name: string) {
    const item = meshCellsCellAttributeLastItem(id, name);
    mutateMeshCellsCellStyle(id, {
      name,
      item,
    });
    return applyCellAttribute(id);
  }
  function setMeshCellsCellAttributeItem(id: string, item: number) {
    mutateMeshCellsCellStyle(id, {
      item,
    });
    return applyCellAttribute(id);
  }
  function meshCellsCellAttributeRange(id: string): [number | undefined, number | undefined] {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshCellsCellAttributeRange(id: string, minimum: number, maximum: number) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    setMeshCellsCellAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyCellAttribute(id);
  }
  function meshCellsCellAttributeColorMap(id: string): string | undefined {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshCellsCellAttributeColorMap(id: string, colorMap: string | undefined) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    setMeshCellsCellAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyCellAttribute(id);
  }
  function meshCellsCellAttributeNoDataColor(id: string): unknown {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshCellsCellAttributeNoDataColor(id: string, no_data_color: unknown) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    await setMeshCellsCellAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyCellAttribute(id);
  }
  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttribute,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeItem,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
    meshCellsCellAttributeNoDataColor,
    setMeshCellsCellAttributeNoDataColor,
  };
}
export { isMeshCellsCellAttributeValid, useMeshCellsCellAttributeStyle };
