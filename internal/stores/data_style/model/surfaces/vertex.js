import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeSchema =
  viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex.attribute;
function isModelSurfacesVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useModelSurfacesVertexAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();
  function modelSurfacesVertexAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).vertex;
  }
  function modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
  }
  function mutateModelSurfacesVertexStyle(modelId, surfaceIds, values) {
    if (surfaceIds.length > 1) {
      modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
        vertex: values,
      });
    }
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
  function modelSurfacesVertexAttributeLastItem(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }
  function modelSurfacesVertexAttributeItem(modelId, surfaceId) {
    const vertexAttribute = modelSurfacesVertexAttribute(modelId, surfaceId);
    return (
      vertexAttribute.item ??
      modelSurfacesVertexAttributeLastItem(modelId, surfaceId, vertexAttribute.name)
    );
  }
  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }
  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.colorMap;
  }
  async function setModelSurfacesVertexAttribute(
    modelId,
    surfaceIds,
    { name, item, minimum, maximum, colorMap, no_data_color = DEFAULT_NO_DATA_COLOR },
  ) {
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      name,
      item,
    });
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
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
      no_data_color: no_data_color ?? DEFAULT_NO_DATA_COLOR,
    };
    return viewerStore.request({
      schema: attributeSchema,
      params,
    });
  }
  function applyVertexAttribute(modelId, surfaceIds) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
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
      no_data_color: storedConfig.no_data_color,
    };
    if (isModelSurfacesVertexAttributeValid(attribute)) {
      return setModelSurfacesVertexAttribute(modelId, surfaceIds, attribute);
    }
    return Promise.resolve();
  }
  function setModelSurfacesVertexAttributeName(modelId, surfaceIds, name) {
    const item = modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      name,
      item,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeItem(modelId, surfaceIds, item) {
    mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      item,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function setModelSurfacesVertexAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  function modelSurfacesVertexAttributeNoDataColor(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    return storedConfig.no_data_color ?? DEFAULT_NO_DATA_COLOR;
  }
  async function setModelSurfacesVertexAttributeNoDataColor(modelId, surfaceIds, no_data_color) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const item = modelSurfacesVertexAttributeItem(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds[0], name, item);
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(modelId, surfaceIds);
  }
  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeItem,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeStoredConfig,
    setModelSurfacesVertexAttribute,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeItem,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeNoDataColor,
    setModelSurfacesVertexAttributeNoDataColor,
  };
}
export { isModelSurfacesVertexAttributeValid, useModelSurfacesVertexAttribute };
