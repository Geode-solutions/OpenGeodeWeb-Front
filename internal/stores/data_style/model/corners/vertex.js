// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex;

export function useModelCornersVertexAttribute() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const viewerStore = useViewerStore();

  function modelCornersVertexAttribute(modelId, cornerId) {
    return modelCornersCommonStyle.modelCornerColoring(modelId, cornerId).vertex;
  }

  function modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function mutateModelCornersVertexStyle(modelId, cornerIds, values) {
    return modelCornersCommonStyle.mutateModelCornersColoring(modelId, cornerIds, {
      vertex: values,
    });
  }

  function modelCornersVertexAttributeLastItem(modelId, cornerId, name) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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

  function modelCornersVertexAttributeValue(modelId, cornerId) {
    const attr = modelCornersVertexAttribute(modelId, cornerId);
    return { name: attr.name, item: attr.item };
  }

  async function setModelCornersVertexAttributeName(modelId, cornerIds, name, item) {
    const currentName = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const targetItem =
      currentName === name
        ? item
        : modelCornersVertexAttributeLastItem(modelId, cornerIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelCornersVertexStyle(modelId, cornerIds, {
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

  function modelCornersVertexAttributeRange(modelId, cornerId) {
    const { name, item } = modelCornersVertexAttributeValue(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelCornersVertexAttributeRange(modelId, cornerIds, minimum, maximum) {
    const { name, item } = modelCornersVertexAttributeValue(modelId, cornerIds[0]);
    const colorMap = modelCornersVertexAttributeColorMap(modelId, cornerIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelCornersVertexAttributeColorMap(modelId, cornerId) {
    const { name, item } = modelCornersVertexAttributeValue(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelCornersVertexAttributeColorMap(modelId, cornerIds, colorMap) {
    const { name, item } = modelCornersVertexAttributeValue(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, {
              colorMap,
            }),
        },
      );
    }
    return setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, item, { colorMap });
  }

  return {
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeValue,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeStoredConfig,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
  };
}
