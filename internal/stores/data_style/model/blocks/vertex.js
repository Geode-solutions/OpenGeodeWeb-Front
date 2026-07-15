// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex;

export function useModelBlocksVertexAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksVertexAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).vertex;
  }

  function modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setModelBlocksVertexAttributeStoredConfig(modelId, [blockId], name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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
    return modelBlocksVertexAttribute(modelId, blockId).item;
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockIds[0]);
    let targetItem = 0;
    let existingConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      targetItem = nameStoredConfigs.lastItem ?? 0;
      existingConfig = nameStoredConfigs[targetItem] ?? {};
    }
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelBlocksVertexStyle(modelId, blockIds, { name, item: targetItem });
          return setModelBlocksVertexAttributeStoredConfig(
            modelId,
            blockIds,
            name,
            targetItem,
            existingConfig,
          );
        },
      },
    );
  }

  async function setModelBlocksVertexAttributeItem(modelId, blockIds, item) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockIds[0]);
    let existingConfig = {};
    if (name in storedConfigs) {
      existingConfig = storedConfigs[name][item] ?? {};
    }
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
            existingConfig,
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
    return Promise.resolve();
  }

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const colorMap = modelBlocksVertexAttributeColorMap(modelId, blockIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelBlocksVertexAttributeColorMap(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, { colorMap }),
        },
      );
    }
    return setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, { colorMap });
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
