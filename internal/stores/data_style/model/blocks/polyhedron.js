// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const modelBlockPolyhedronAttributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron.attribute;

function isModelBlocksPolyhedronAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelBlocksPolyhedronAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksPolyhedronAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron;
  }

  function modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
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

  function modelBlocksPolyhedronAttributeRange(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function modelBlocksPolyhedronAttributeColorMap(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    return storedConfig.colorMap;
  }

  function applyPolyhedronAttribute(modelId, blockIds) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isModelBlocksPolyhedronAttributeValid(attribute)) {
      return setModelBlocksPolyhedronAttribute(modelId, blockIds, attribute);
    }
  }

  function setModelBlocksPolyhedronAttributeName(modelId, blockIds, name) {
    const item = modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, { name, item });
    return applyPolyhedronAttribute(modelId, blockIds);
  }

  function setModelBlocksPolyhedronAttributeItem(modelId, blockIds, item) {
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, { item });
    return applyPolyhedronAttribute(modelId, blockIds);
  }

  function setModelBlocksPolyhedronAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(modelId, blockIds);
  }

  function setModelBlocksPolyhedronAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const item = modelBlocksPolyhedronAttributeItem(modelId, blockIds[0]);
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, { colorMap });
    return applyPolyhedronAttribute(modelId, blockIds);
  }

  async function setModelBlocksPolyhedronAttribute(
    modelId,
    blockIds,
    { name, item, minimum, maximum, colorMap },
  ) {
    mutateModelBlocksPolyhedronStyle(modelId, blockIds, { name, item });
    setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
      colorMap,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = {
      id: modelId,
      block_ids: viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
    };
    return viewerStore.request({ schema: modelBlockPolyhedronAttributeSchema, params });
  }

  return {
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeItem,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeStoredConfig,
    setModelBlocksPolyhedronAttribute,
    setModelBlocksPolyhedronAttributeName,
    setModelBlocksPolyhedronAttributeItem,
    setModelBlocksPolyhedronAttributeRange,
    setModelBlocksPolyhedronAttributeColorMap,
  };
}

export { isModelBlocksPolyhedronAttributeValid, useModelBlocksPolyhedronAttribute };
