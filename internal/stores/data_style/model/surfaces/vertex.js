// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

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
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setModelSurfacesVertexAttributeStoredConfig(modelId, [surfaceId], name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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
    if (!viewer_ids?.length) {
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

    return viewerStore.request(schema.name, { id: modelId, block_ids: viewer_ids, name });
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
    const colorMap = modelSurfacesVertexAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
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
    if (!surfaceIds?.length) {
      return;
    }

    const name = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
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
