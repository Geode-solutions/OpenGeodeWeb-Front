// oxlint-disable eslint/max-lines
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge.attribute;

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

function isModelLinesEdgeAttributeValid({
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

interface UseModelLinesEdgeAttributeReturn {
  modelLinesEdgeAttributeName: (modelId: string, lineId?: string) => string | undefined;
  modelLinesEdgeAttributeItem: (modelId: string, lineId?: string) => number;
  modelLinesEdgeAttributeRange: (
    modelId: string,
    lineId?: string,
  ) => [number | undefined, number | undefined];
  modelLinesEdgeAttributeColorMap: (modelId: string, lineId?: string) => string | undefined;
  modelLinesEdgeAttributeStoredConfig: (
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setModelLinesEdgeAttribute: (
    modelId: string,
    lineIds: string[],
    input: AttributeInput,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeName: (
    modelId: string,
    lineIds: string[],
    name: string,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeItem: (
    modelId: string,
    lineIds: string[],
    item: number,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeRange: (
    modelId: string,
    lineIds: string[],
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setModelLinesEdgeAttributeColorMap: (
    modelId: string,
    lineIds: string[],
    colorMap: string | undefined,
  ) => Promise<unknown>;
  modelLinesEdgeAttributeNoDataColor: (modelId: string, lineId?: string) => unknown;
  setModelLinesEdgeAttributeNoDataColor: (
    modelId: string,
    lineIds: string[],
    no_data_color: unknown,
  ) => Promise<unknown>;
}

// oxlint-disable-next-line max-lines-per-function
function useModelLinesEdgeAttribute(): UseModelLinesEdgeAttributeReturn {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();
  function modelLinesEdgeAttribute(modelId: string, lineId?: string): AttributeState {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.edge shape is defined by the data style schema.
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge as AttributeState;
  }
  function modelLinesEdgeAttributeStoredConfig(
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
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
  async function mutateModelLinesEdgeStyle(
    modelId: string,
    lineIds: string[],
    values: Record<string, unknown>,
  ): Promise<void> {
    const tasks: Promise<void>[] = [
      modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
        edge: values,
      }),
    ];
    if (lineIds.length > 1) {
      tasks.push(
        modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
          edge: values,
        }),
      );
    }
    await Promise.all(tasks);
  }
  async function setModelLinesEdgeAttributeStoredConfig(
    modelId: string,
    lineIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ): Promise<void> {
    if (name === undefined || item === undefined) {
      return;
    }
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  function modelLinesEdgeAttributeName(modelId: string, lineId?: string): string | undefined {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }
  function modelLinesEdgeAttributeLastItem(
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
  ): number {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    const nameConfig = name === undefined ? undefined : storedConfigs?.[name];
    if (nameConfig !== undefined) {
      return nameConfig.lastItem;
    }
    return 0;
  }
  function modelLinesEdgeAttributeItem(modelId: string, lineId?: string): number {
    const edgeAttribute = modelLinesEdgeAttribute(modelId, lineId);
    return (
      edgeAttribute.item ?? modelLinesEdgeAttributeLastItem(modelId, lineId, edgeAttribute.name)
    );
  }
  function modelLinesEdgeAttributeRange(
    modelId: string,
    lineId?: string,
  ): [number | undefined, number | undefined] {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelLinesEdgeAttributeColorMap(modelId: string, lineId?: string): string | undefined {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelLinesEdgeAttribute(
    modelId: string,
    lineIds: string[],
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: AttributeInput,
  ): Promise<unknown> {
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap ?? "");
    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = {
      id: modelId,
      block_ids: line_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema: attributeSchema,
      params,
    });
  }
  async function applyEdgeAttribute(modelId: string, lineIds: string[]): Promise<void> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const attribute: AttributeInput = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelLinesEdgeAttributeValid(attribute)) {
      await setModelLinesEdgeAttribute(modelId, lineIds, attribute);
    }
  }
  async function setModelLinesEdgeAttributeName(
    modelId: string,
    lineIds: string[],
    name: string,
  ): Promise<unknown> {
    const item = modelLinesEdgeAttributeLastItem(modelId, lineIds[0], name);
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeItem(
    modelId: string,
    lineIds: string[],
    item: number,
  ): Promise<unknown> {
    await mutateModelLinesEdgeStyle(modelId, lineIds, {
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeRange(
    modelId: string,
    lineIds: string[],
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  async function setModelLinesEdgeAttributeColorMap(
    modelId: string,
    lineIds: string[],
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  function modelLinesEdgeAttributeNoDataColor(modelId: string, lineId?: string): unknown {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.no_data_color;
  }
  async function setModelLinesEdgeAttributeNoDataColor(
    modelId: string,
    lineIds: string[],
    no_data_color: unknown,
  ): Promise<unknown> {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    await setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttribute,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeItem,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeNoDataColor,
    setModelLinesEdgeAttributeNoDataColor,
  };
}
export { isModelLinesEdgeAttributeValid, useModelLinesEdgeAttribute };
