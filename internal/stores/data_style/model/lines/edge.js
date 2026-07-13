// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge;

export function useModelLinesEdgeAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesEdgeAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge;
  }

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function mutateModelLinesEdgeStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      edge: values,
    });
  }

  function modelLinesEdgeAttributeLastItem(modelId, lineId, name) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
  }

  function setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, config) {
    return mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelLinesEdgeAttributeName(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }

  function modelLinesEdgeAttributeValue(modelId, lineId) {
    const attr = modelLinesEdgeAttribute(modelId, lineId);
    return { name: attr.name, item: attr.item };
  }

  async function setModelLinesEdgeAttributeName(modelId, lineIds, name, item) {
    const currentName = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const targetItem =
      currentName === name ? item : modelLinesEdgeAttributeLastItem(modelId, lineIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelLinesEdgeStyle(modelId, lineIds, {
            name,
            item: targetItem,
            storedConfigs: {
              [name]: {
                lastItem: targetItem,
              },
            },
          }),
      },
    );
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const { name, item } = modelLinesEdgeAttributeValue(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    const { name, item } = modelLinesEdgeAttributeValue(modelId, lineIds[0]);
    const colorMap = modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelLinesEdgeAttributeColorMap(modelId, lineId) {
    const { name, item } = modelLinesEdgeAttributeValue(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    const { name, item } = modelLinesEdgeAttributeValue(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { colorMap }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { colorMap });
  }

  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeValue,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}
