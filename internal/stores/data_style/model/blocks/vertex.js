// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useModelBlocksVertexAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksVertexAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).vertex;
  }

  function modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelBlocksVertexAttributeStoredConfig(modelId, [blockId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelBlocksVertexStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      vertex: values,
    });
  }

  function setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, config) {
    return mutateModelBlocksVertexStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelBlocksVertexAttributeName(modelId, blockId) {
    return modelBlocksVertexAttribute(modelId, blockId).name;
  }

  function modelBlocksVertexAttributeItem(modelId, blockId) {
    const vertexAttribute = modelBlocksVertexAttribute(modelId, blockId);
    return (
      vertexAttribute.item ??
      modelBlocksVertexAttributeLastItem(modelId, blockId, vertexAttribute.name)
    );
  }

  function modelBlocksVertexAttributeLastItem(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name) {
    const item = modelBlocksVertexAttributeLastItem(modelId, blockIds[0], name);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelBlocksVertexStyle(modelId, blockIds, { name, item });
          return setModelBlocksVertexAttributeStoredConfig(
            modelId,
            blockIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  async function setModelBlocksVertexAttributeItem(modelId, blockIds, item) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelBlocksVertexStyle(modelId, blockIds, { item });
          return setModelBlocksVertexAttributeStoredConfig(
            modelId,
            blockIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  function setModelBlocksVertexAttribute(modelId, blockIds, name, item) {
    const currentName = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    if (name !== currentName) {
      return setModelBlocksVertexAttributeName(modelId, blockIds, name);
    }
    const currentItem = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    if (item !== currentItem) {
      return setModelBlocksVertexAttributeItem(modelId, blockIds, item);
    }
  }

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const colorMap = modelBlocksVertexAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
        minimum,
        maximum,
      });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
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

  function modelBlocksVertexAttributeColorMap(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
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
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeItem,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeStoredConfig,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeItem,
    setModelBlocksVertexAttribute,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
  };
}
