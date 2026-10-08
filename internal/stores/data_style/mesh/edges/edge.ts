import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.edge_attribute_names;
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: RGBAColor;
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
  no_data_color?: RGBAColor;
}

interface ValidAttributeInput {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
}

function isMeshEdgesEdgeAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesEdgeAttributeStyle(): {
  meshEdgesEdgeAttributeName: (id: string) => string | undefined;
  meshEdgesEdgeAttributeItem: (id: string) => number;
  meshEdgesEdgeAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeTimeStep: (id: string) => number | undefined;
  setMeshEdgesEdgeAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshEdgesEdgeAttributeColorMap: (id: string) => string | undefined;
  meshEdgesEdgeAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesEdgeAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesEdgeAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshEdgesEdgeAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshEdgesEdgeAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesEdgeAttributeColorMap: (id: string, colorMap: string | undefined) => Promise<unknown>;
  meshEdgesEdgeAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshEdgesEdgeAttributeNoDataColor: (id: string, no_data_color: RGBAColor) => Promise<unknown>;
} {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
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
  function meshEdgesEdgeAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshEdgesEdgeAttribute(id).name);
  }
  async function setMeshEdgesEdgeAttribute(
    id: string,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshEdgesEdgeAttributeSchemas.attribute;
    const params = {
      id,
      name: seriesArrayName(id, attributeNamesSchema.$id, name),
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
  async function applyEdgeAttribute(id: string): Promise<unknown> {
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
      const result = await setMeshEdgesEdgeAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshEdgesEdgeAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshEdgesEdgeAttributeLastItem(id, name);
    await mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshEdgesEdgeStyle(id, {
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
  async function setMeshEdgesEdgeAttributeTimeStep(id: string, timeStep: number): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
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
  async function setMeshEdgesEdgeAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(id);
  }
  function meshEdgesEdgeAttributeNoDataColor(id: string): RGBAColor {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshEdgesEdgeAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
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
    meshEdgesEdgeAttributeTimeStep,
    setMeshEdgesEdgeAttributeTimeStep,
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
