// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useModelLinesVertexAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesVertexAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).vertex;
  }

  function modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelLinesVertexAttributeStoredConfig(modelId, [lineId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelLinesVertexStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      vertex: values,
    });
  }

  function setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, config) {
    return mutateModelLinesVertexStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelLinesVertexAttributeName(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }

  function modelLinesVertexAttributeItem(modelId, lineId) {
    const vertexAttribute = modelLinesVertexAttribute(modelId, lineId);
    return (
      vertexAttribute.item ??
      modelLinesVertexAttributeLastItem(modelId, lineId, vertexAttribute.name)
    );
  }

  function modelLinesVertexAttributeLastItem(modelId, lineId, name) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  async function setModelLinesVertexAttributeName(modelId, lineIds, name) {
    const item = modelLinesVertexAttributeLastItem(modelId, lineIds[0], name);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesVertexStyle(modelId, lineIds, { name, item });
          return setModelLinesVertexAttributeStoredConfig(
            modelId,
            lineIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  async function setModelLinesVertexAttributeItem(modelId, lineIds, item) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesVertexStyle(modelId, lineIds, { item });
          return setModelLinesVertexAttributeStoredConfig(
            modelId,
            lineIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  function setModelLinesVertexAttribute(modelId, lineIds, name, item) {
    const currentName = modelLinesVertexAttributeName(modelId, lineIds[0]);
    if (name !== currentName) {
      return setModelLinesVertexAttributeName(modelId, lineIds, name);
    }
    const currentItem = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    if (item !== currentItem) {
      return setModelLinesVertexAttributeItem(modelId, lineIds, item);
    }
  }

  function modelLinesVertexAttributeRange(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelLinesVertexAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const colorMap = modelLinesVertexAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
        minimum,
        maximum,
      });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  function modelLinesVertexAttributeColorMap(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelLinesVertexAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  return {
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeItem,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeStoredConfig,
    setModelLinesVertexAttributeName,
    setModelLinesVertexAttributeItem,
    setModelLinesVertexAttribute,
    setModelLinesVertexAttributeRange,
    setModelLinesVertexAttributeColorMap,
  };
}
