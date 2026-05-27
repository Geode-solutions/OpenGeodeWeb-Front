// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { validate_schema } from "@ogw_front/utils/validate_schema";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex;

export function useModelSurfacesVertexAttributeStyle() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesVertexAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surfaceId).vertex_attribute;
  }

  function modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (name && storedConfigs && name in storedConfigs) {
      return storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateModelSurfacesVertexStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesStyle(modelId, surfaceIds, {
      vertex_attribute: values,
    });
  }

  function setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, config) {
    return mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelSurfacesVertexAttributeName(modelId, surfaceId) {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }

  async function setModelSurfacesVertexAttributeName(modelId, surfaceIds, name) {
    if (!surfaceIds?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    if (!validate_schema(schema.name, params).valid) {
      return;
    }

    const updates = { name };
    const vertex = modelSurfacesVertexAttribute(modelId, surfaceIds[0]);
    if (!(name in vertex.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }
    await mutateModelSurfacesVertexStyle(modelId, surfaceIds, updates);

    return viewerStore.request(schema.name, params);
  }

  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesVertexAttributeRange(modelId, surfaceIds, minimum, maximum) {
    if (!surfaceIds?.length) {
      return;
    }

    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, {
      minimum,
      maximum,
    });

    const colorMap = modelSurfacesVertexAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesVertexAttributeColorMap(modelId, surfaceIds, colorMap) {
    if (!surfaceIds?.length) {
      return;
    }

    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    await setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, { colorMap });

    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
    if (validate_schema(schema.color_map, params).valid) {
      return viewerStore.request(schema.color_map, params);
    }
  }

  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeStoredConfig,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
  };
}
