import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex;

export function useModelSurfacesVertexAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesVertexAttribute(modelId, surfaceId) {
    const style = dataStyleState.getComponentStyle(modelId, surfaceId);
    return style.vertex_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelSurfacesVertexAttributeName(modelId, surfaceId) {
    return modelSurfacesVertexAttribute(modelId, surfaceId).name;
  }

  function modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name) {
    const attribute = modelSurfacesVertexAttribute(modelId, surfaceId);
    if (name && attribute.storedConfigs && name in attribute.storedConfigs) {
      return attribute.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelSurfacesVertexAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelSurfacesVertexAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesVertexAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesVertexAttributeStoredConfig(modelId, surfaceId, name);
    return storedConfig.colorMap;
  }

  async function setModelSurfacesVertexAttributeName(modelId, surfaceIds, name) {
    if (!surfaceIds?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    if (!viewer_ids?.length) {
      return;
    }

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids: viewer_ids, name },
      {
        response_function: async () => {
          const updates = surfaceIds.map((surfaceId) => {
            const current = modelSurfacesVertexAttribute(modelId, surfaceId);
            const nameUpdate = { name };
            if (!(name in current.storedConfigs)) {
              nameUpdate.storedConfigs = {
                [name]: {
                  minimum: undefined,
                  maximum: undefined,
                  colorMap: undefined,
                },
              };
            }
            const updated = merge({}, current, nameUpdate);
            return {
              id_component: surfaceId,
              values: {
                vertex_attribute: updated,
              },
            };
          });
          await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
        },
      },
    );
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
          response_function: async () => {
            const updates = surfaceIds.map((surfaceId) => {
              const current = modelSurfacesVertexAttribute(modelId, surfaceId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { minimum, maximum } },
              });
              return {
                id_component: surfaceId,
                values: {
                  vertex_attribute: updated,
                },
              };
            });
            await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
          },
        },
      );
    }

    const updates = surfaceIds.map((surfaceId) => {
      const current = modelSurfacesVertexAttribute(modelId, surfaceId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: surfaceId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
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
          response_function: async () => {
            const updates = surfaceIds.map((surfaceId) => {
              const current = modelSurfacesVertexAttribute(modelId, surfaceId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { colorMap } },
              });
              return {
                id_component: surfaceId,
                values: {
                  vertex_attribute: updated,
                },
              };
            });
            await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
          },
        },
      );
    }

    const updates = surfaceIds.map((surfaceId) => {
      const current = modelSurfacesVertexAttribute(modelId, surfaceId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: surfaceId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
  }

  return {
    modelSurfacesVertexAttributeName,
    modelSurfacesVertexAttributeRange,
    modelSurfacesVertexAttributeColorMap,
    setModelSurfacesVertexAttributeName,
    setModelSurfacesVertexAttributeRange,
    setModelSurfacesVertexAttributeColorMap,
  };
}
