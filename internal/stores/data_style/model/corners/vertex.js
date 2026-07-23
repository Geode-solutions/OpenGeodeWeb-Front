// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex.attribute;

function isModelCornersVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelCornersVertexAttribute() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const viewerStore = useViewerStore();

  function modelCornersVertexAttribute(modelId, cornerId) {
    return modelCornersCommonStyle.modelCornerColoring(modelId, cornerId).vertex;
  }

  function modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelCornersVertexStyle(modelId, cornerIds, values) {
    return modelCornersCommonStyle.mutateModelCornersColoring(modelId, cornerIds, {
      vertex: values,
    });
  }

  function setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, config) {
    return mutateModelCornersVertexStyle(modelId, cornerIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelCornersVertexAttributeName(modelId, cornerId) {
    return modelCornersVertexAttribute(modelId, cornerId).name;
  }

  function modelCornersVertexAttributeItem(modelId, cornerId) {
    const vertexAttribute = modelCornersVertexAttribute(modelId, cornerId);
    return (
      vertexAttribute.item ??
      modelCornersVertexAttributeLastItem(modelId, cornerId, vertexAttribute.name)
    );
  }

  function modelCornersVertexAttributeLastItem(modelId, cornerId, name) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function modelCornersVertexAttributeRange(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function modelCornersVertexAttributeColorMap(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    return storedConfig.colorMap;
  }

  function applyVertexAttribute(modelId, cornerIds) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isModelCornersVertexAttributeValid(attribute)) {
      return setModelCornersVertexAttribute(modelId, cornerIds, attribute);
    }
    return Promise.resolve();
  }

  function setModelCornersVertexAttributeName(modelId, cornerIds, name) {
    const item = modelCornersVertexAttributeLastItem(modelId, cornerIds[0], name);
    mutateModelCornersVertexStyle(modelId, cornerIds, { name, item });
    return applyVertexAttribute(modelId, cornerIds);
  }

  function setModelCornersVertexAttributeItem(modelId, cornerIds, item) {
    mutateModelCornersVertexStyle(modelId, cornerIds, { item });
    return applyVertexAttribute(modelId, cornerIds);
  }

  function setModelCornersVertexAttributeRange(modelId, cornerIds, minimum, maximum) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, cornerIds);
  }

  function setModelCornersVertexAttributeColorMap(modelId, cornerIds, colorMap) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, { colorMap });
    return applyVertexAttribute(modelId, cornerIds);
  }

  async function setModelCornersVertexAttribute(
    modelId,
    cornerIds,
    { name, item, minimum, maximum, colorMap },
  ) {
    mutateModelCornersVertexStyle(modelId, cornerIds, { name, item });
    setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
      colorMap,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = {
      id: modelId,
      block_ids: corner_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
    };
    return viewerStore.request({ schema: attributeSchema, params });
  }

  return {
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeItem,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeStoredConfig,
    setModelCornersVertexAttribute,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeItem,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
  };
}

export { isModelCornersVertexAttributeValid, useModelCornersVertexAttribute };
