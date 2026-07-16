// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon;

// oxlint-disable-next-line max-lines-per-function
export function useModelSurfacesPolygonAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesPolygonAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).polygon;
  }

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelSurfacesPolygonAttributeStoredConfig(modelId, [surfaceId], name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateModelSurfacesPolygonStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      polygon: values,
    });
  }

  function setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, config) {
    return mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelSurfacesPolygonAttributeName(modelId, surfaceId) {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }

  function modelSurfacesPolygonAttributeItem(modelId, surfaceId) {
    const polygonAttribute = modelSurfacesPolygonAttribute(modelId, surfaceId);
    return (
      polygonAttribute.item ??
      modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, polygonAttribute.name)
    );
  }

  function modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  async function setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name) {
    const item = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
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
          mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
          return setModelSurfacesPolygonAttributeStoredConfig(
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

  async function setModelSurfacesPolygonAttributeItem(modelId, surfaceIds, item) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
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
          mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { item });
          return setModelSurfacesPolygonAttributeStoredConfig(
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

  function setModelSurfacesPolygonAttribute(modelId, surfaceIds, name, item) {
    const currentName = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    if (name !== currentName) {
      return setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name);
    }
    const currentItem = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    if (item !== currentItem) {
      return setModelSurfacesPolygonAttributeItem(modelId, surfaceIds, item);
    }
  }

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesPolygonAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
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

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesPolygonAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
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
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeStoredConfig,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeItem,
    setModelSurfacesPolygonAttribute,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
  };
}
