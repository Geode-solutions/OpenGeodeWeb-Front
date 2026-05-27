// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { validate_schema } from "@ogw_front/utils/validate_schema";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex;

export function useModelCornersVertexAttributeStyle() {
  const dataStore = useDataStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const viewerStore = useViewerStore();

  function modelCornersVertexAttribute(modelId, cornerId) {
    return modelCornersCommonStyle.modelCornerStyle(modelId, cornerId).vertex_attribute;
  }

  function modelCornersVertexAttributeStoredConfig(modelId, cornerId, name) {
    const { storedConfigs } = modelCornersVertexAttribute(modelId, cornerId);
    if (name && storedConfigs && name in storedConfigs) {
      return storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelCornersVertexStyle(modelId, cornerIds, values) {
    return modelCornersCommonStyle.mutateModelCornersStyle(modelId, cornerIds, {
      vertex_attribute: values,
    });
  }

  function setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, config) {
    return mutateModelCornersVertexStyle(modelId, cornerIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelCornersVertexAttributeName(modelId, cornerId) {
    return modelCornersVertexAttribute(modelId, cornerId).name;
  }

  async function setModelCornersVertexAttributeName(modelId, cornerIds, name) {
    if (!cornerIds?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    if (!validate_schema(schema.name, params).valid) {
      return;
    }

    const updates = { name };
    const vertex = modelCornersVertexAttribute(modelId, cornerIds[0]);
    if (!(name in vertex.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }
    await mutateModelCornersVertexStyle(modelId, cornerIds, updates);

    return viewerStore.request(schema.name, params);
  }

  function modelCornersVertexAttributeRange(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelCornersVertexAttributeRange(modelId, cornerIds, minimum, maximum) {
    if (!cornerIds?.length) {
      return;
    }

    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, {
      minimum,
      maximum,
    });

    const colorMap = modelCornersVertexAttributeColorMap(modelId, cornerIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  function modelCornersVertexAttributeColorMap(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelCornersVertexAttributeColorMap(modelId, cornerIds, colorMap) {
    if (!cornerIds?.length) {
      return;
    }

    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    await setModelCornersVertexAttributeStoredConfig(modelId, cornerIds, name, { colorMap });

    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  return {
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    modelCornersVertexAttributeStoredConfig,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
  };
}
