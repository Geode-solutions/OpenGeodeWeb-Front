// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron;

// oxlint-disable-next-line max-lines-per-function
export function useModelBlocksPolyhedronAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksPolyhedronAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron;
  }

  function modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, [blockId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelBlocksPolyhedronStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      polyhedron: values,
    });
  }

  function setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, config) {
    return mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelBlocksPolyhedronAttributeName(modelId, blockId) {
    return modelBlocksPolyhedronAttribute(modelId, blockId).name;
  }

  function modelBlocksPolyhedronAttributeItem(modelId, blockId) {
    const polyhedronAttribute = modelBlocksPolyhedronAttribute(modelId, blockId);
    return (
      polyhedronAttribute.item ??
      modelBlocksPolyhedronAttributeLastItem(modelId, blockId, polyhedronAttribute.name)
    );
  }

  function modelBlocksPolyhedronAttributeLastItem(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  async function setModelBlocksPolyhedronAttributeName(modelId, blockIds, name) {
    const item = modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelBlocksPolyhedronStyle(modelId, blockIds, { name, item });
          return setModelBlocksPolyhedronAttributeStoredConfig(
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

  async function setModelBlocksPolyhedronAttributeItem(modelId, blockIds, item) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelBlocksPolyhedronStyle(modelId, blockIds, { item });
          return setModelBlocksPolyhedronAttributeStoredConfig(
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

  function setModelBlocksPolyhedronAttribute(modelId, blockIds, name, item) {
    const currentName = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    if (name !== currentName) {
      return setModelBlocksPolyhedronAttributeName(modelId, blockIds, name);
    }
    const currentItem = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    if (item !== currentItem) {
      return setModelBlocksPolyhedronAttributeItem(modelId, blockIds, item);
    }
  }

  function modelBlocksPolyhedronAttributeRange(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelBlocksPolyhedronAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    const colorMap = modelBlocksPolyhedronAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
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

  function modelBlocksPolyhedronAttributeColorMap(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelBlocksPolyhedronAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
        colorMap,
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

  return {
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeItem,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeStoredConfig,
    setModelBlocksPolyhedronAttributeName,
    setModelBlocksPolyhedronAttributeItem,
    setModelBlocksPolyhedronAttribute,
    setModelBlocksPolyhedronAttributeRange,
    setModelBlocksPolyhedronAttributeColorMap,
  };
}
