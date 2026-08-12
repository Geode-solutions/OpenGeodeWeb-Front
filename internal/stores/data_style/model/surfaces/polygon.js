// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon.attribute;

function isModelSurfacesPolygonAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesPolygonAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesPolygonAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).polygon;
  }

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelSurfacesPolygonStyle(modelId, surfaceIds, values) {
    if (surfaceIds.length > 1) {
      modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
        polygon: values,
      });
    }
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

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }

  function applyPolygonAttribute(modelId, surfaceIds) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(
      modelId,
      surfaceIds[0],
      name,
      item,
    );
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isModelSurfacesPolygonAttributeValid(attribute)) {
      return setModelSurfacesPolygonAttribute(modelId, surfaceIds, attribute);
    }
    return Promise.resolve();
  }

  function setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name) {
    const item = modelSurfacesPolygonAttributeLastItem(modelId, surfaceIds[0], name);
    mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    return applyPolygonAttribute(modelId, surfaceIds);
  }

  function setModelSurfacesPolygonAttributeItem(modelId, surfaceIds, item) {
    mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { item });
    return applyPolygonAttribute(modelId, surfaceIds);
  }

  function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
    return applyPolygonAttribute(modelId, surfaceIds);
  }

  function setModelSurfacesPolygonAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesPolygonAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, { colorMap });
    return applyPolygonAttribute(modelId, surfaceIds);
  }

  async function setModelSurfacesPolygonAttribute(
    modelId,
    surfaceIds,
    { name, item, minimum, maximum, colorMap },
  ) {
    mutateModelSurfacesPolygonStyle(modelId, surfaceIds, { name, item });
    setModelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
      colorMap,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = {
      id: modelId,
      block_ids: surface_viewer_ids,
      name,
      item,
      points,
      minimum,
      maximum,
    };
    return viewerStore.request({ schema: attributeSchema, params });
  }

  return {
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeItem,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    modelSurfacesPolygonAttributeStoredConfig,
    setModelSurfacesPolygonAttribute,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeItem,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
  };
}

export { isModelSurfacesPolygonAttributeValid, useModelSurfacesPolygonAttribute };
