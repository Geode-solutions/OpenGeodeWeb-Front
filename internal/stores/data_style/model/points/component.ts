// oxlint-disable eslint/max-lines
import {
  type AttributeState,
  type AttributeStoredConfig,
  groupBy,
} from "@ogw_internal/stores/data_style/model/component_style";
import {
  DEFAULT_NO_DATA_COLOR,
  POINTS_DEFAULT_COLOR,
  POINTS_DEFAULT_SIZE,
  POINTS_DEFAULT_VISIBILITY,
  type RGBAColor,
} from "@ogw_front/utils/default_styles/constants";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Points of corners are the corners themselves, so only these components get their own points style
const POINTS_COMPONENT_TYPES = ["Line", "Surface", "Block"] as const;
type PointsComponentType = (typeof POINTS_COMPONENT_TYPES)[number];

const modelSchemas = viewer_schemas.opengeodeweb_viewer.model;
const COMPONENT_TYPE_KEYS = {
  Line: "lines",
  Surface: "surfaces",
  Block: "blocks",
} as const;

type PointsSchemas =
  (typeof modelSchemas)[(typeof COMPONENT_TYPE_KEYS)[PointsComponentType]]["points"];
type PointsRequestSchema =
  | PointsSchemas["visibility"]
  | PointsSchemas["size"]
  | PointsSchemas["color"]
  | PointsSchemas["attribute"]["vertex"]["attribute"];

interface PointsStyle {
  visibility?: boolean;
  size?: number;
  coloring?: {
    active?: string;
    constant?: RGBAColor;
    vertex?: AttributeState;
  };
}

// Return type is inferred, see ModelComponentPointsStyle: signatures live on the functions only
// oxlint-disable-next-line max-lines-per-function, max-statements, typescript/explicit-function-return-type, typescript/explicit-module-boundary-types
function useModelComponentPointsStyle(type: PointsComponentType) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();
  const { seriesArrayName } = useAttributeTimeStepStyle();
  const schemas = modelSchemas[COMPONENT_TYPE_KEYS[type]].points;

  // Without an explicit points style, components follow the model points style
  function pointsStyle(modelId: string, componentId?: string): PointsStyle {
    // oxlint-disable-next-line no-unsafe-type-assertion -- points shape is defined by the data style schema.
    const modelPoints = (dataStyleState.getStyle(modelId).points ?? {}) as PointsStyle;
    // oxlint-disable-next-line no-unsafe-type-assertion -- points shape is defined by the data style schema.
    const typePoints = dataStyleState.getModelComponentTypeStyle(modelId, type).points as
      | PointsStyle
      | undefined;
    const componentPoints =
      componentId === undefined
        ? undefined
        : // oxlint-disable-next-line no-unsafe-type-assertion -- points shape is defined by the data style schema.
          (dataStyleState.getComponentStyle(modelId, componentId).points as
            | PointsStyle
            | undefined);
    return merge(
      {
        visibility: modelPoints.visibility ?? POINTS_DEFAULT_VISIBILITY,
        size: modelPoints.size ?? POINTS_DEFAULT_SIZE,
        coloring: { active: "constant", constant: POINTS_DEFAULT_COLOR },
      },
      typePoints,
      componentPoints,
    );
  }

  function vertexAttribute(modelId: string, componentId?: string): AttributeState {
    return pointsStyle(modelId, componentId).coloring?.vertex ?? {};
  }

  function pointsVisibility(modelId: string, componentId?: string): boolean {
    return pointsStyle(modelId, componentId).visibility ?? POINTS_DEFAULT_VISIBILITY;
  }

  function pointsSize(modelId: string, componentId?: string): number {
    return pointsStyle(modelId, componentId).size ?? POINTS_DEFAULT_SIZE;
  }

  function pointsColor(modelId: string, componentId?: string): RGBAColor {
    return pointsStyle(modelId, componentId).coloring?.constant ?? POINTS_DEFAULT_COLOR;
  }

  function activeColoring(modelId: string, componentId?: string): string {
    return pointsStyle(modelId, componentId).coloring?.active ?? "constant";
  }

  function vertexAttributeName(modelId: string, componentId?: string): string | undefined {
    return vertexAttribute(modelId, componentId).name;
  }

  function lastItem(modelId: string, componentId: string | undefined, name?: string): number {
    const { storedConfigs } = vertexAttribute(modelId, componentId);
    return name === undefined ? 0 : (storedConfigs?.[name]?.lastItem ?? 0);
  }

  function vertexAttributeItem(modelId: string, componentId?: string): number {
    const { name, item } = vertexAttribute(modelId, componentId);
    return item ?? lastItem(modelId, componentId, name);
  }

  function storedConfig(modelId: string, componentId: string | undefined): AttributeStoredConfig {
    const { name, storedConfigs } = vertexAttribute(modelId, componentId);
    const item = vertexAttributeItem(modelId, componentId);
    const config = name === undefined ? undefined : storedConfigs?.[name]?.[item];
    // A stored config may be partial, missing fields fall back to the defaults
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
      ...config,
    };
  }

  function vertexAttributeRange(
    modelId: string,
    componentId?: string,
  ): [number | undefined, number | undefined] {
    const { minimum, maximum } = storedConfig(modelId, componentId);
    return [minimum, maximum];
  }

  function vertexAttributeColorMap(modelId: string, componentId?: string): string | undefined {
    return storedConfig(modelId, componentId).colorMap;
  }

  function vertexAttributeNoDataColor(modelId: string, componentId?: string): RGBAColor {
    return storedConfig(modelId, componentId).no_data_color;
  }

  // The type style is updated too when every component of the type is targeted
  async function mutatePoints(
    modelId: string,
    componentIds: string[],
    values: PointsStyle,
  ): Promise<void> {
    const tasks = [
      modelCommonStyle.mutateComponentStyles(modelId, componentIds, { points: values }),
    ];
    const totalIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (componentIds.length === totalIds.length) {
      tasks.push(modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, { points: values }));
    }
    await Promise.all(tasks);
  }

  async function requestPoints(
    modelId: string,
    componentIds: string[],
    schema: PointsRequestSchema,
    values: Record<string, unknown> & { style: PointsStyle },
  ): Promise<unknown> {
    if (componentIds.length === 0) {
      return undefined;
    }
    const block_ids = await dataStore.getMeshComponentsViewerIds(modelId, componentIds);
    if (!block_ids?.length) {
      return undefined;
    }
    const { style, ...params } = values;
    const result = await viewerStore.request(
      // oxlint-disable-next-line no-unsafe-type-assertion, no-unnecessary-type-assertion -- params match the points schema of every component type.
      { schema, params: { id: modelId, block_ids, ...params } } as Parameters<
        typeof viewerStore.request
      >[0],
      {
        response_function: async () => {
          await mutatePoints(modelId, componentIds, style);
        },
      },
    );
    return result;
  }

  async function setVisibility(
    modelId: string,
    componentIds: string[],
    visibility: boolean,
  ): Promise<unknown> {
    const result = await requestPoints(modelId, componentIds, schemas.visibility, {
      visibility,
      style: { visibility },
    });
    return result;
  }

  async function setSize(modelId: string, componentIds: string[], size: number): Promise<unknown> {
    const result = await requestPoints(modelId, componentIds, schemas.size, {
      size,
      style: { size },
    });
    return result;
  }

  async function setColor(
    modelId: string,
    componentIds: string[],
    color: RGBAColor,
  ): Promise<unknown> {
    const result = await requestPoints(modelId, componentIds, schemas.color, {
      color,
      style: { coloring: { active: "constant", constant: color } },
    });
    return result;
  }

  async function applyVertexAttribute(modelId: string, componentIds: string[]): Promise<unknown> {
    const [referenceId] = componentIds;
    const name = vertexAttributeName(modelId, referenceId);
    const item = vertexAttributeItem(modelId, referenceId);
    const { minimum, maximum, colorMap, no_data_color } = storedConfig(modelId, referenceId);
    if (
      name === undefined ||
      minimum === undefined ||
      maximum === undefined ||
      colorMap === undefined
    ) {
      return undefined;
    }
    const schema = schemas.attribute.vertex.attribute;
    const result = await requestPoints(modelId, componentIds, schema, {
      name: seriesArrayName(modelId, schema.$id, name),
      item,
      points: [...getRGBPointsFromPreset(colorMap)],
      minimum,
      maximum,
      no_data_color,
      style: { coloring: { active: "vertex" } },
    });
    return result;
  }

  async function mutateVertexAttribute(
    modelId: string,
    componentIds: string[],
    values: AttributeState,
  ): Promise<void> {
    await mutatePoints(modelId, componentIds, { coloring: { vertex: values } });
  }

  async function mutateStoredConfig(
    modelId: string,
    componentIds: string[],
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    const name = vertexAttributeName(modelId, componentIds[0]);
    const item = vertexAttributeItem(modelId, componentIds[0]);
    const itemConfigs = { lastItem: item, [item]: config };
    // oxlint-disable-next-line no-unsafe-type-assertion -- partial stored config is merged into the existing one.
    const storedConfigs = { [name ?? ""]: itemConfigs } as AttributeState["storedConfigs"];
    await mutateVertexAttribute(modelId, componentIds, { storedConfigs });
  }

  async function setActiveColoring(
    modelId: string,
    componentIds: string[],
    activeColoringType: string,
  ): Promise<unknown> {
    await mutatePoints(modelId, componentIds, { coloring: { active: activeColoringType } });
    if (activeColoringType === "vertex") {
      const result = await applyVertexAttribute(modelId, componentIds);
      return result;
    }
    const result = await setColor(modelId, componentIds, pointsColor(modelId, componentIds[0]));
    return result;
  }

  async function setVertexAttributeName(
    modelId: string,
    componentIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = lastItem(modelId, componentIds[0], name);
    await mutateVertexAttribute(modelId, componentIds, { name, item });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeItem(
    modelId: string,
    componentIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateVertexAttribute(modelId, componentIds, { item });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeRange(
    modelId: string,
    componentIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { minimum, maximum });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeColorMap(
    modelId: string,
    componentIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { colorMap });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeNoDataColor(
    modelId: string,
    componentIds: string[],
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { no_data_color });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function styledComponentIds(modelId: string): Promise<string[]> {
    const componentIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (dataStyleState.getModelComponentTypeStyle(modelId, type).points !== undefined) {
      return componentIds;
    }
    return componentIds.filter(
      (componentId) => dataStyleState.getComponentStyle(modelId, componentId).points !== undefined,
    );
  }

  // The model points routes override every component, so the explicit points styles follow
  async function mutateStyledPoints(modelId: string, values: PointsStyle): Promise<void> {
    const componentIds = await styledComponentIds(modelId);
    if (componentIds.length > 0) {
      await mutatePoints(modelId, componentIds, values);
    }
  }

  // Only components with an explicit points style are sent, the others follow the model points
  async function applyPointsStyle(modelId: string): Promise<void> {
    const componentIds = await styledComponentIds(modelId);
    function style(componentId?: string): PointsStyle {
      return pointsStyle(modelId, componentId);
    }
    await Promise.all([
      ...groupBy(componentIds, (id) => String(style(id).visibility)).map(async (ids) => {
        await setVisibility(modelId, ids, pointsVisibility(modelId, ids[0]));
      }),
      ...groupBy(componentIds, (id) => String(style(id).size)).map(async (ids) => {
        await setSize(modelId, ids, pointsSize(modelId, ids[0]));
      }),
      ...groupBy(componentIds, (id) => JSON.stringify(style(id).coloring)).map(async (ids) => {
        await setActiveColoring(modelId, ids, activeColoring(modelId, ids[0]));
      }),
    ]);
  }

  return {
    visibility: pointsVisibility,
    size: pointsSize,
    color: pointsColor,
    activeColoring,
    vertexAttributeName,
    vertexAttributeItem,
    vertexAttributeRange,
    vertexAttributeColorMap,
    vertexAttributeNoDataColor,
    setVisibility,
    setSize,
    setColor,
    setActiveColoring,
    setVertexAttributeName,
    setVertexAttributeItem,
    setVertexAttributeRange,
    setVertexAttributeColorMap,
    setVertexAttributeNoDataColor,
    mutateStyledPoints,
    applyPointsStyle,
  };
}

type ModelComponentPointsStyle = ReturnType<typeof useModelComponentPointsStyle>;

export { POINTS_COMPONENT_TYPES, useModelComponentPointsStyle };
export type { ModelComponentPointsStyle };
