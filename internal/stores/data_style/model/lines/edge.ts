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

// oxlint-disable-next-line max-lines-per-function
function useModelLinesEdgeAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();
  function modelLinesEdgeAttribute(modelId: string, lineId?: string): AttributeState {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge as AttributeState;
  }
  function modelLinesEdgeAttributeStoredConfig(
    modelId: string,
    lineId: string | undefined,
    name: string | undefined,
    item: number | undefined,
  ): AttributeStoredConfig {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
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
  function mutateModelLinesEdgeStyle(
    modelId: string,
    lineIds: string[],
    values: Record<string, unknown>,
  ) {
    if (lineIds.length > 1) {
      modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        edge: values,
      });
    }
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      edge: values,
    });
  }
  function setModelLinesEdgeAttributeStoredConfig(
    modelId: string,
    lineIds: string[],
    name: string | undefined,
    item: number | undefined,
    config: Partial<AttributeStoredConfig>,
  ) {
    return mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name as string]: {
          lastItem: item,
          [item as number]: config,
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
    if (storedConfigs && name !== undefined && name in storedConfigs) {
      return storedConfigs[name]!.lastItem;
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
  ) {
    mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap as string);
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
  function applyEdgeAttribute(modelId: string, lineIds: string[]) {
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
      return setModelLinesEdgeAttribute(modelId, lineIds, attribute);
    }
    return Promise.resolve();
  }
  function setModelLinesEdgeAttributeName(modelId: string, lineIds: string[], name: string) {
    const item = modelLinesEdgeAttributeLastItem(modelId, lineIds[0], name);
    mutateModelLinesEdgeStyle(modelId, lineIds, {
      name,
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  function setModelLinesEdgeAttributeItem(modelId: string, lineIds: string[], item: number) {
    mutateModelLinesEdgeStyle(modelId, lineIds, {
      item,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  function setModelLinesEdgeAttributeRange(
    modelId: string,
    lineIds: string[],
    minimum: number,
    maximum: number,
  ) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(modelId, lineIds);
  }
  function setModelLinesEdgeAttributeColorMap(
    modelId: string,
    lineIds: string[],
    colorMap: string | undefined,
  ) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
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
  ) {
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
