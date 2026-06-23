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

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setModelSurfacesPolygonAttributeStoredConfig(modelId, [surfaceId], name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateModelSurfacesPolygonStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      polygon: values,
    });
  }

  function setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, config) {
    return mutateModelSurfacesPolygonStyle(modelId, surfaceIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelSurfacesPolygonAttributeName(modelId, surfaceId) {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }

  async function setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name) {
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: (response) => {
          mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name });
          for (let i = 0; i < surfaceIds.length; i++) {
            const surfaceId = surfaceIds[i];
            const blockRange = response?.[viewer_ids[i]] || {};
            setModelSurfacesPolygonAttributeStoredConfig(modelId, [surfaceId], name, {
              minimum: blockRange.minimum,
              maximum: blockRange.maximum,
            });
            setModelSurfacesPolygonAttributeColorMap(modelId, [surfaceId], "batlow");
          }
        },
      },
    );
  }

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesPolygonAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, {
      minimum,
      maximum,
    });
  }

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesPolygonAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, { colorMap }),
        },
      );
    }
    return setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, { colorMap });
  }

  return {
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeStoredConfig,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
  };
}
