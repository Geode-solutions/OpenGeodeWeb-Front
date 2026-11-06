// oxlint-disable eslint/max-lines
import type {
  AttributeState,
  AttributeStoredConfig,
} from "@ogw_internal/stores/data_style/attribute_types";
import {
  EDGES_DEFAULT_COLOR,
  EDGES_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_WIDTH,
  type RGBAColor,
} from "@ogw_front/utils/default_styles/constants";
import type { Visibility, Width } from "@ogw_front/types/style";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { ModelId } from "@ogw_front/types/identifiers";
import { defaultAttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_default";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { groupBy } from "@ogw_internal/stores/data_style/model/component_style";
import merge from "lodash/merge";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Lines are edges themselves and corners have none, so only these components get their own edges style
const EDGES_COMPONENT_TYPES = ["Surface", "Block"] as const;
type EdgesComponentType = (typeof EDGES_COMPONENT_TYPES)[number];

const modelSchemas = viewer_schemas.opengeodeweb_viewer.model;
const COMPONENT_TYPE_KEYS = {
  Surface: "surfaces",
  Block: "blocks",
} as const;

type EdgesSchemas =
  (typeof modelSchemas)[(typeof COMPONENT_TYPE_KEYS)[EdgesComponentType]]["edges"];
type EdgesRequestSchema =
  | EdgesSchemas["visibility"]
  | EdgesSchemas["width"]
  | EdgesSchemas["color"]
  | EdgesSchemas["attribute"]["vertex"]["attribute"];

interface EdgesStyle {
  visibility?: Visibility;
  width?: Width;
  coloring?: {
    active?: string;
    constant?: RGBAColor;
    vertex?: AttributeState;
  };
}

// Return type is inferred, see ModelComponentEdgesStyle: signatures live on the functions only
// oxlint-disable-next-line max-lines-per-function, max-statements, typescript/explicit-function-return-type, typescript/explicit-module-boundary-types
function useModelComponentEdgesStyle(type: EdgesComponentType) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();
  const { seriesArrayName } = useAttributeTimeStepStyle();
  const schemas = modelSchemas[COMPONENT_TYPE_KEYS[type]].edges;

  // Without an explicit edges style, components follow the model edges style
  function edgesStyle(modelId: ModelId, componentId?: string): EdgesStyle {
    // oxlint-disable-next-line no-unsafe-type-assertion -- edges shape is defined by the data style schema.
    const modelEdges = (dataStyleState.getStyle(modelId).edges ?? {}) as EdgesStyle;
    // oxlint-disable-next-line no-unsafe-type-assertion -- edges shape is defined by the data style schema.
    const typeEdges = dataStyleState.getModelComponentTypeStyle(modelId, type).edges as
      | EdgesStyle
      | undefined;
    const componentEdges =
      componentId === undefined
        ? undefined
        : // oxlint-disable-next-line no-unsafe-type-assertion -- edges shape is defined by the data style schema.
          (dataStyleState.getComponentStyle(modelId, componentId).edges as EdgesStyle | undefined);
    return merge(
      {
        visibility: modelEdges.visibility ?? EDGES_DEFAULT_VISIBILITY,
        width: modelEdges.width ?? EDGES_DEFAULT_WIDTH,
        coloring: { active: "constant", constant: EDGES_DEFAULT_COLOR },
      },
      typeEdges,
      componentEdges,
    );
  }

  function vertexAttribute(modelId: ModelId, componentId?: string): AttributeState {
    return edgesStyle(modelId, componentId).coloring?.vertex ?? {};
  }

  function edgesVisibility(modelId: ModelId, componentId?: string): Visibility {
    return edgesStyle(modelId, componentId).visibility ?? EDGES_DEFAULT_VISIBILITY;
  }

  function edgesWidth(modelId: ModelId, componentId?: string): Width {
    return edgesStyle(modelId, componentId).width ?? EDGES_DEFAULT_WIDTH;
  }

  function edgesColor(modelId: ModelId, componentId?: string): RGBAColor {
    return edgesStyle(modelId, componentId).coloring?.constant ?? EDGES_DEFAULT_COLOR;
  }

  function activeColoring(modelId: ModelId, componentId?: string): string {
    return edgesStyle(modelId, componentId).coloring?.active ?? "constant";
  }

  function vertexAttributeName(modelId: ModelId, componentId?: string): AttributeName | undefined {
    return vertexAttribute(modelId, componentId).name;
  }

  function lastItem(
    modelId: ModelId,
    componentId: string | undefined,
    name?: AttributeName,
  ): number {
    const { storedConfigs } = vertexAttribute(modelId, componentId);
    return name === undefined ? 0 : (storedConfigs?.[name]?.lastItem ?? 0);
  }

  function vertexAttributeItem(modelId: ModelId, componentId?: string): number {
    const { name, item } = vertexAttribute(modelId, componentId);
    return item ?? lastItem(modelId, componentId, name);
  }

  function storedConfig(modelId: ModelId, componentId: string | undefined): AttributeStoredConfig {
    const { name, storedConfigs } = vertexAttribute(modelId, componentId);
    const item = vertexAttributeItem(modelId, componentId);
    const config = name === undefined ? undefined : storedConfigs?.[name]?.[item];
    // A stored config may be partial, missing fields fall back to the defaults
    return { ...defaultAttributeStoredConfig(), ...config };
  }

  function vertexAttributeRange(
    modelId: ModelId,
    componentId?: string,
  ): [number | undefined, number | undefined] {
    const { minimum, maximum } = storedConfig(modelId, componentId);
    return [minimum, maximum];
  }

  function vertexAttributeColorMap(modelId: ModelId, componentId?: string): string | undefined {
    return storedConfig(modelId, componentId).colorMap;
  }

  function vertexAttributeNoDataColor(modelId: ModelId, componentId?: string): RGBAColor {
    return storedConfig(modelId, componentId).no_data_color;
  }

  // The type style is updated too when every component of the type is targeted
  async function mutateEdges(
    modelId: ModelId,
    componentIds: string[],
    values: EdgesStyle,
  ): Promise<void> {
    const tasks = [
      modelCommonStyle.mutateComponentStyles(modelId, componentIds, { edges: values }),
    ];
    const totalIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (componentIds.length === totalIds.length) {
      tasks.push(modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, { edges: values }));
    }
    await Promise.all(tasks);
  }

  async function requestEdges(
    modelId: ModelId,
    componentIds: string[],
    schema: EdgesRequestSchema,
    values: Record<string, unknown> & { style: EdgesStyle },
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
      // oxlint-disable-next-line no-unsafe-type-assertion, no-unnecessary-type-assertion -- params match the edges schema of every component type.
      { schema, params: { id: modelId, block_ids, ...params } } as Parameters<
        typeof viewerStore.request
      >[0],
      {
        response_function: async () => {
          await mutateEdges(modelId, componentIds, style);
        },
      },
    );
    return result;
  }

  async function setVisibility(
    modelId: ModelId,
    componentIds: string[],
    visibility: Visibility,
  ): Promise<unknown> {
    const result = await requestEdges(modelId, componentIds, schemas.visibility, {
      visibility,
      style: { visibility },
    });
    return result;
  }

  async function setWidth(
    modelId: ModelId,
    componentIds: string[],
    width: Width,
  ): Promise<unknown> {
    const result = await requestEdges(modelId, componentIds, schemas.width, {
      width,
      style: { width },
    });
    return result;
  }

  async function setColor(
    modelId: ModelId,
    componentIds: string[],
    color: RGBAColor,
  ): Promise<unknown> {
    const result = await requestEdges(modelId, componentIds, schemas.color, {
      color,
      style: { coloring: { active: "constant", constant: color } },
    });
    return result;
  }

  async function applyVertexAttribute(modelId: ModelId, componentIds: string[]): Promise<unknown> {
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
    const result = await requestEdges(modelId, componentIds, schema, {
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
    modelId: ModelId,
    componentIds: string[],
    values: AttributeState,
  ): Promise<void> {
    await mutateEdges(modelId, componentIds, { coloring: { vertex: values } });
  }

  async function mutateStoredConfig(
    modelId: ModelId,
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
    modelId: ModelId,
    componentIds: string[],
    activeColoringType: string,
  ): Promise<unknown> {
    await mutateEdges(modelId, componentIds, { coloring: { active: activeColoringType } });
    if (activeColoringType === "vertex") {
      const result = await applyVertexAttribute(modelId, componentIds);
      return result;
    }
    const result = await setColor(modelId, componentIds, edgesColor(modelId, componentIds[0]));
    return result;
  }

  async function setVertexAttributeName(
    modelId: ModelId,
    componentIds: string[],
    name: AttributeName,
  ): Promise<unknown> {
    const item = lastItem(modelId, componentIds[0], name);
    await mutateVertexAttribute(modelId, componentIds, { name, item });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeItem(
    modelId: ModelId,
    componentIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateVertexAttribute(modelId, componentIds, { item });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeRange(
    modelId: ModelId,
    componentIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { minimum, maximum });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeColorMap(
    modelId: ModelId,
    componentIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { colorMap });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function setVertexAttributeNoDataColor(
    modelId: ModelId,
    componentIds: string[],
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    await mutateStoredConfig(modelId, componentIds, { no_data_color });
    const result = await applyVertexAttribute(modelId, componentIds);
    return result;
  }

  async function styledComponentIds(modelId: ModelId): Promise<string[]> {
    const componentIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (dataStyleState.getModelComponentTypeStyle(modelId, type).edges !== undefined) {
      return componentIds;
    }
    return componentIds.filter(
      (componentId) => dataStyleState.getComponentStyle(modelId, componentId).edges !== undefined,
    );
  }

  // The model edges routes override every component, so the explicit edges styles follow
  async function mutateStyledEdges(modelId: ModelId, values: EdgesStyle): Promise<void> {
    const componentIds = await styledComponentIds(modelId);
    if (componentIds.length > 0) {
      await mutateEdges(modelId, componentIds, values);
    }
  }

  // Only components with an explicit edges style are sent, the others follow the model edges
  async function applyEdgesStyle(modelId: ModelId): Promise<void> {
    const componentIds = await styledComponentIds(modelId);
    function style(componentId?: string): EdgesStyle {
      return edgesStyle(modelId, componentId);
    }
    await Promise.all([
      ...groupBy(componentIds, (id) => String(style(id).visibility)).map(async (ids) => {
        await setVisibility(modelId, ids, edgesVisibility(modelId, ids[0]));
      }),
      ...groupBy(componentIds, (id) => String(style(id).width)).map(async (ids) => {
        await setWidth(modelId, ids, edgesWidth(modelId, ids[0]));
      }),
      ...groupBy(componentIds, (id) => JSON.stringify(style(id).coloring)).map(async (ids) => {
        await setActiveColoring(modelId, ids, activeColoring(modelId, ids[0]));
      }),
    ]);
  }

  return {
    visibility: edgesVisibility,
    width: edgesWidth,
    color: edgesColor,
    activeColoring,
    vertexAttributeName,
    vertexAttributeItem,
    vertexAttributeRange,
    vertexAttributeColorMap,
    vertexAttributeNoDataColor,
    setVisibility,
    setWidth,
    setColor,
    setActiveColoring,
    setVertexAttributeName,
    setVertexAttributeItem,
    setVertexAttributeRange,
    setVertexAttributeColorMap,
    setVertexAttributeNoDataColor,
    mutateStyledEdges,
    applyEdgesStyle,
  };
}

type ModelComponentEdgesStyle = ReturnType<typeof useModelComponentEdgesStyle>;

export { EDGES_COMPONENT_TYPES, useModelComponentEdgesStyle };
export type { ModelComponentEdgesStyle };
