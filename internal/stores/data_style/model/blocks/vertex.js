// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { validate_schema } from "@ogw_front/utils/validate_schema";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex;

export function useModelBlocksVertexAttributeStyle() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksVertexAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockStyle(modelId, blockId).vertex_attribute;
  }

  function modelBlocksVertexAttributeStoredConfig(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksVertexAttribute(modelId, blockId);
    if (name && storedConfigs && name in storedConfigs) {
      return storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelBlocksVertexStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksStyle(modelId, blockIds, {
      vertex_attribute: values,
    });
  }

  function setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, config) {
    return mutateModelBlocksVertexStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelBlocksVertexAttributeName(modelId, blockId) {
    return modelBlocksVertexAttribute(modelId, blockId).name;
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name) {
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    if (!validate_schema(schema.name, params).valid) {
      return;
    }

    const updates = { name };
    const vertex = modelBlocksVertexAttribute(modelId, blockIds[0]);
    if (!(name in vertex.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }
    await mutateModelBlocksVertexStyle(modelId, blockIds, updates);

    return viewerStore.request(schema.name, params);
  }

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, {
      minimum,
      maximum,
    });

    const colorMap = modelBlocksVertexAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  function modelBlocksVertexAttributeColorMap(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    await setModelBlocksVertexAttributeStoredConfig(modelId, blockIds, name, { colorMap });

    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  return {
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    modelBlocksVertexAttributeStoredConfig,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
  };
}
