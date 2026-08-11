// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge.attribute;

function isModelLinesEdgeAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelLinesEdgeAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesEdgeAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge;
  }

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelLinesEdgeStyle(modelId, lineIds, values) {
    if (lineIds.length > 1) {
      modelLinesCommonStyle.mutateModelLinesTypeColoring(modelId, {
        edge: values,
      });
    }
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
    const edgeAttribute = modelLinesEdgeAttribute(modelId, lineId);
    return (
      edgeAttribute.item ?? modelLinesEdgeAttributeLastItem(modelId, lineId, edgeAttribute.name)
    );
  }

  function modelLinesEdgeAttributeLastItem(modelId, lineId, name) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function modelLinesEdgeAttributeColorMap(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    return storedConfig.colorMap;
  }

  function applyEdgeAttribute(modelId, lineIds) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isModelLinesEdgeAttributeValid(attribute)) {
      return setModelLinesEdgeAttribute(modelId, lineIds, attribute);
    }
    return Promise.resolve();
  }

  function setModelLinesEdgeAttributeName(modelId, lineIds, name) {
    const item = modelLinesEdgeAttributeLastItem(modelId, lineIds[0], name);
    mutateModelLinesEdgeStyle(modelId, lineIds, { name, item });
    return applyEdgeAttribute(modelId, lineIds);
  }

  function setModelLinesEdgeAttributeItem(modelId, lineIds, item) {
    mutateModelLinesEdgeStyle(modelId, lineIds, { item });
    return applyEdgeAttribute(modelId, lineIds);
  }

  function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { minimum, maximum });
    return applyEdgeAttribute(modelId, lineIds);
  }

  function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { colorMap });
    return applyEdgeAttribute(modelId, lineIds);
  }

  async function setModelLinesEdgeAttribute(
    modelId,
    lineIds,
    { name, item, minimum, maximum, colorMap },
  ) {
    mutateModelLinesEdgeStyle(modelId, lineIds, { name, item });
    setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
      colorMap,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const line_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = {
      id: modelId,
      block_ids: line_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
    };
    return viewerStore.request({ schema: attributeSchema, params });
  }

  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttribute,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeItem,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}

export { isModelLinesEdgeAttributeValid, useModelLinesEdgeAttribute };
