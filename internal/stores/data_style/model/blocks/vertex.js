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
      return storedConfigs[name][item];
    }
  }

  function mutateModelBlocksVertexStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      vertex: values,
    });
  }

  function modelBlocksVertexAttributeLastItem(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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

  function modelBlocksVertexAttributeValue(modelId, blockId) {
    const attr = modelBlocksVertexAttribute(modelId, blockId);
    return { name: attr.name, item: attr.item };
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name, item) {
    const currentName = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const targetItem =
      currentName === name ? item : modelBlocksVertexAttributeLastItem(modelId, blockIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelBlocksVertexStyle(modelId, blockIds, {
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

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const { name, item } = modelBlocksVertexAttributeValue(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    const { name, item } = modelBlocksVertexAttributeValue(modelId, blockIds[0]);
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
    const { name, item } = modelBlocksVertexAttributeValue(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    const { name, item } = modelBlocksVertexAttributeValue(modelId, blockIds[0]);
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
    modelBlocksVertexAttributeValue,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeStoredConfig,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
  };
}
