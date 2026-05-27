// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { validate_schema } from "@ogw_front/utils/validate_schema";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon;

export function useModelSurfacesPolygonAttributeStyle() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesPolygonAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surfaceId).polygon_attribute;
  }

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name && storedConfigs && name in storedConfigs) {
      return storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelSurfacesPolygonStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesStyle(modelId, surfaceIds, {
      polygon_attribute: values,
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
    if (!validate_schema(schema.name, params).valid) {
      return;
    }

    const updates = { name };
    const polygon = modelSurfacesPolygonAttribute(modelId, surfaceIds[0]);
    if (!(name in polygon.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }
    await mutateModelSurfacesPolygonStyle(modelId, surfaceIds, updates);

    return viewerStore.request(schema.name, params);
  }

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, {
      minimum,
      maximum,
    });

    const colorMap = modelSurfacesPolygonAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesPolygonAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    await setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, { colorMap });

    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
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
