// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex;

export function useModelSurfacesVertexAttribute() {
  const dataStore = useDataStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesVertexAttribute(modelId, surfaceId) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surfaceId).coloring.vertex;
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
      coloring: {
        vertex: values,
      },
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
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);

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

    const params = { id: modelId, block_ids: viewer_ids, name };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => mutateModelSurfacesVertexStyle(modelId, surfaceIds, updates),
      },
    );
  }

  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelSurfacesVertexAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesVertexAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, {
      minimum,
      maximum,
    });
  }

  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelSurfacesVertexAttributeColorMap(modelId, surfaceIds, colorMap) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, { colorMap }),
        },
      );
    }
    return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, { colorMap });
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
