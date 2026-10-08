import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

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

function isMeshPointsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPointsVertexAttributeStyleReturn {
  meshPointsVertexAttributeName: (id: string) => string | undefined;
  meshPointsVertexAttributeItem: (id: string) => number;
  meshPointsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPointsVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshPointsVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPointsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPointsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPointsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPointsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPointsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPointsVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPointsVertexAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPointsVertexAttributeStyle(): UseMeshPointsVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  function meshPointsVertexAttribute(id: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.vertex shape is defined by the data style schema.
    return meshPointsCommonStyle.meshPointsColoring(id).vertex as AttributeState;
  }
  function meshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = meshPointsVertexAttribute(id);
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
  async function mutateMeshPointsVertexStyle(
    id: string,
    values: Record<string, unknown>,
  ): Promise<string> {
    const result = await meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
    return result;
  }
  async function setMeshPointsVertexAttributeStoredConfig(
    id: string,
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<string> {
    const result = await mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name ?? ""]: {
          lastItem: item,
          [item ?? 0]: config,
        },
      },
    });
    return result;
  }
  function meshPointsVertexAttributeName(id: string): string | undefined {
    return meshPointsVertexAttribute(id).name;
  }
  function meshPointsVertexAttributeLastItem(id: string, name: string | undefined): number {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function meshPointsVertexAttributeItem(id: string): number {
    const { item, name } = meshPointsVertexAttribute(id);
    return item ?? meshPointsVertexAttributeLastItem(id, name);
  }
  function meshPointsVertexAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshPointsVertexAttribute(id).name);
  }
  async function setMeshPointsVertexAttribute(
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
    await mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPointsVertexAttributeSchemas.attribute;
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
  async function applyVertexAttribute(id: string): Promise<unknown> {
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
      const result = await setMeshPointsVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPointsVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPointsVertexAttributeLastItem(id, name);
    await mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPointsVertexStyle(id, {
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
  async function setMeshPointsVertexAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
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
  async function setMeshPointsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPointsVertexAttributeNoDataColor(id: string): RGBAColor {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color;
  }
  async function setMeshPointsVertexAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
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
    meshPointsVertexAttributeTimeStep,
    setMeshPointsVertexAttributeTimeStep,
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
