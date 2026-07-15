// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon;

export function useModelSurfacesPolygonAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesPolygonAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).polygon;
  }

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function mutateModelSurfacesPolygonStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      polygon: values,
    });
  }

  function modelSurfacesPolygonAttributeLastItem(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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
    return modelSurfacesPolygonAttribute(modelId, surfaceId).item;
  }

  async function setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name) {
    const targetItem = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
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

  async function setModelSurfacesPolygonAttributeItem(modelId, surfaceIds, item) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
            item,
            storedConfigs: {
              [name]: {
                lastItem: item,
              },
            },
          }),
      },
    );
  }

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesPolygonAttributeColorMap(modelId, surfaceIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
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
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
              colorMap,
            }),
        },
      );
    }
    return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
  }

  return {
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeStoredConfig,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeItem,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
  };
}
