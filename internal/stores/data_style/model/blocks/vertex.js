// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex.attribute;

function isModelBlocksVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksVertexAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksVertexAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).vertex;
  }

  function modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
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

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function modelBlocksVertexAttributeColorMap(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const item = modelBlocksVertexAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }

  function applyVertexAttribute(modelId, blockIds) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isModelBlocksVertexAttributeValid(attribute)) {
      return setModelBlocksVertexAttribute(modelId, blockIds, attribute);
    }
    return Promise.resolve();
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name) {
    const item = modelBlocksVertexAttributeLastItem(modelId, blockIds[0], name);
    await mutateModelBlocksVertexStyle(modelId, blockIds, { name, item });
    return applyVertexAttribute(modelId, blockIds);
  }

  async function setModelBlocksVertexAttributeItem(modelId, blockIds, item) {
    await mutateModelBlocksVertexStyle(modelId, blockIds, { item });
    return applyVertexAttribute(modelId, blockIds);
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, { minimum, maximum });
    return applyVertexAttribute(modelId, blockIds);
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, { colorMap });
    return applyVertexAttribute(modelId, blockIds);
  }

  async function setModelBlocksVertexAttribute(
    modelId,
    blockIds,
    { name, item, minimum, maximum, colorMap },
  ) {
    mutateModelBlocksVertexStyle(modelId, blockIds, { name, item });
    setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
      colorMap,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: block_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
    };
    return viewerStore.request({ schema: attributeSchema, params });
  }

  return {
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeItem,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeStoredConfig,
    setModelBlocksVertexAttribute,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeItem,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
  };
}

export { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute };
