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
    return modelSurfacesCommonStyle.modelSurfaceColoring(modelId, surfaceId).vertex;
  }

  function modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function mutateModelSurfacesVertexStyle(modelId, surfaceIds, values) {
    return modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaceIds, {
      vertex: values,
    });
  }

  function modelSurfacesVertexAttributeLastItem(modelId, surfaceId, name) {
    const { storedConfigs } = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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

  function modelSurfacesVertexAttributeValue(modelId, surfaceId) {
    const attr = modelSurfacesVertexAttribute(modelId, surfaceId);
    return { name: attr.name, item: attr.item };
  }

  async function setModelSurfacesVertexAttributeName(modelId, surfaceIds, name, item) {
    const currentName = modelSurfacesVertexAttributeName(modelId, surfaceIds[0]);
    const targetItem =
      currentName === name
        ? item
        : modelSurfacesVertexAttributeLastItem(modelId, surfaceIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelSurfacesVertexStyle(modelId, surfaceIds, {
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

  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const { name, item } = modelSurfacesVertexAttributeValue(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelSurfacesVertexAttributeRange(modelId, surfaceIds, minimum, maximum) {
    const { name, item } = modelSurfacesVertexAttributeValue(modelId, surfaceIds[0]);
    const colorMap = modelSurfacesVertexAttributeColorMap(modelId, surfaceIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const { name, item } = modelSurfacesVertexAttributeValue(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelSurfacesVertexAttributeColorMap(modelId, surfaceIds, colorMap) {
    const { name, item } = modelSurfacesVertexAttributeValue(modelId, surfaceIds[0]);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(
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
            setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
              colorMap,
            }),
        },
      );
    }
    return setModelSurfacesVertexAttributeStoredConfig(modelId, surfaceIds, name, item, {
      colorMap,
    });
  }

  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeValue,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    modelSurfacesVertexAttributeStoredConfig,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
  };
}
