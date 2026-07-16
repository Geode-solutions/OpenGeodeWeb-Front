// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useModelCornersVertexAttribute() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const viewerStore = useViewerStore();

  function modelCornersVertexAttribute(modelId, cornerId) {
    return modelCornersCommonStyle.modelCornerColoring(modelId, cornerId).vertex;
  }

  function modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return setModelCornersVertexAttributeStoredConfig(modelId, [cornerId], name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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

  // oxlint-disable-next-line duplicate-exports
  function modelCornersVertexAttributeItem(modelId, cornerId) {
    return modelCornersVertexAttribute(modelId, cornerId).item;
  }

  async function setModelCornersVertexAttributeName(modelId, cornerIds, name) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerIds[0]);
    let item = 0;
    if (name in storedConfigs) {
      item = storedConfigs[name].lastItem ?? 0;
    }
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelCornersVertexStyle(modelId, cornerIds, { name, item });
          return setModelCornersVertexAttributeStoredConfig(
            modelId,
            cornerIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  async function setModelCornersVertexAttributeItem(modelId, cornerIds, item) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelCornersVertexStyle(modelId, cornerIds, { item });
          return setModelCornersVertexAttributeStoredConfig(
            modelId,
            cornerIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  function setModelCornersVertexAttribute(modelId, cornerIds, name, item) {
    const currentName = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    if (name !== currentName) {
      return setModelCornersVertexAttributeName(modelId, cornerIds, name);
    }
    const currentItem = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    if (item !== currentItem) {
      return setModelCornersVertexAttributeItem(modelId, cornerIds, item);
    }
    return Promise.resolve();
  }

  function modelCornersVertexAttributeRange(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelCornersVertexAttributeRange(modelId, cornerIds, minimum, maximum) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const colorMap = modelCornersVertexAttributeColorMap(modelId, cornerIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

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
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const item = modelCornersVertexAttributeItem(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelCornersVertexAttributeColorMap(modelId, cornerIds, colorMap) {
    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const item = modelCornersVertexAttributeItem(modelId, cornerIds[0]);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

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
    modelCornersVertexAttributeItem,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeStoredConfig,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeItem,
    setModelCornersVertexAttribute,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
  };
}
