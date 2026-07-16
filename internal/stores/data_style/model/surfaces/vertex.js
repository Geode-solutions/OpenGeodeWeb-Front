// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useModelSurfacesVertexAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesVertexAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).vertex;
  }

  function modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelSurfacesVertexAttributeStoredConfig(modelId, [surfaceId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelSurfacesVertexStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      vertex: values,
    });
  }

  function setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, config) {
    return mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelSurfacesVertexAttributeName(modelId, surfaceId) {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }

  function modelSurfacesVertexAttributeItem(modelId, surfaceId) {
    const vertexAttribute = modelSurfacesVertexAttribute(modelId, surfaceId);
    return (
      vertexAttribute.item ??
      modelSurfacesVertexAttributeLastItem(modelId, surfaceId, vertexAttribute.name)
    );
  }

  function modelSurfacesVertexAttributeLastItem(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  async function setModelSurfacesVertexAttributeName(modelId, surfaceIds, name) {
    const item = modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelSurfacesVertexStyle(modelId, surfaceIds, { name, item });
          return setModelSurfacesVertexAttributeStoredConfig(
            modelId,
            surfaceIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  async function setModelSurfacesVertexAttributeItem(modelId, surfaceIds, item) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelSurfacesVertexStyle(modelId, surfaceIds, { item });
          return setModelSurfacesVertexAttributeStoredConfig(
            modelId,
            surfaceIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  function setModelSurfacesVertexAttribute(modelId, surfaceIds, name, item) {
    const currentName = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    if (name !== currentName) {
      return setModelSurfacesVertexAttributeName(modelId, surfaceIds, name);
    }
    const currentItem = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    if (item !== currentItem) {
      return setModelSurfacesVertexAttributeItem(modelId, surfaceIds, item);
    }
  }

  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesVertexAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesVertexAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
        minimum,
        maximum,
      });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesVertexAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
        colorMap,
      });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeItem,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeStoredConfig,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeItem,
    setModelSurfacesVertexAttribute,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
  };
}
