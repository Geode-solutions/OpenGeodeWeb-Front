// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex;

export function useModelLinesVertexAttributeStyle() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesVertexAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineStyle(modelId, lineId).vertex_attribute;
  }

  function modelLinesVertexAttributeStoredConfig(modelId, lineId, name) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    if (name && storedConfigs && name in storedConfigs) {
      return storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelLinesVertexStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesStyle(modelId, lineIds, {
      vertex_attribute: values,
    });
  }

  function setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, config) {
    return mutateModelLinesVertexStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelLinesVertexAttributeName(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }

  async function setModelLinesVertexAttributeName(modelId, lineIds, name) {
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);

    const updates = { name };
    const vertex = modelLinesVertexAttribute(modelId, lineIds[0]);
    if (!(name in vertex.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }

    const params = { id: modelId, block_ids: viewer_ids, name };
    return viewerStore.request(schema.name, params, {
      response_function: () => mutateModelLinesVertexStyle(modelId, lineIds, updates),
    });
  }

  function modelLinesVertexAttributeRange(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelLinesVertexAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const colorMap = modelLinesVertexAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(schema.color_map, params, {
        response_function: () =>
          setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, { minimum, maximum }),
      });
    }
    return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, { minimum, maximum });
  }

  function modelLinesVertexAttributeColorMap(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelLinesVertexAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(schema.color_map, params, {
        response_function: () =>
          setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, { colorMap }),
      });
    }
    return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, { colorMap });
  }

  return {
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeStoredConfig,
    setModelLinesVertexAttributeName,
    setModelLinesVertexAttributeRange,
    setModelLinesVertexAttributeColorMap,
  };
}
