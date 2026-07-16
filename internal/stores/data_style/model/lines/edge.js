// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge;

// oxlint-disable-next-line max-lines-per-function
export function useModelLinesEdgeAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesEdgeAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge;
  }

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelLinesEdgeAttributeStoredConfig(modelId, [lineId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelLinesEdgeStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      edge: values,
    });
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

  function modelLinesEdgeAttributeItem(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).item;
  }

  async function setModelLinesEdgeAttributeName(modelId, lineIds, name) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineIds[0]);
    let item = 0;
    if (name in storedConfigs) {
      item = storedConfigs[name].lastItem ?? 0;
    }
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesEdgeStyle(modelId, lineIds, { name, item });
          return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, storedConfig);
        },
      },
    );
  }

  async function setModelLinesEdgeAttributeItem(modelId, lineIds, item) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesEdgeStyle(modelId, lineIds, { item });
          return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, storedConfig);
        },
      },
    );
  }

  function setModelLinesEdgeAttribute(modelId, lineIds, name, item) {
    const currentName = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    if (name !== currentName) {
      return setModelLinesEdgeAttributeName(modelId, lineIds, name);
    }
    const currentItem = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    if (item !== currentItem) {
      return setModelLinesEdgeAttributeItem(modelId, lineIds, item);
    }
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const colorMap = modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

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
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

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
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeItem,
    setModelLinesEdgeAttribute,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}
