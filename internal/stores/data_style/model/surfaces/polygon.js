import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon;

export function useModelSurfacesPolygonAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelSurfacesPolygonAttribute(modelId, surfaceId) {
    const style = dataStyleState.getComponentStyle(modelId, surfaceId);
    return style.polygon_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelSurfacesPolygonAttributeName(modelId, surfaceId) {
    return modelSurfacesPolygonAttribute(modelId, surfaceId).name;
  }

  function modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name) {
    const attr = modelSurfacesPolygonAttribute(modelId, surfaceId);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelSurfacesPolygonAttributeRange(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelSurfacesPolygonAttributeColorMap(modelId, surfaceId) {
    const name = modelSurfacesPolygonAttributeName(modelId, surfaceId);
    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceId, name);
    return storedConfig.colorMap;
  }

  async function setModelSurfacesPolygonAttributeName(modelId, surfaceIds, name) {
    if (!surfaceIds?.length) {
      return;
    }

    const updates = surfaceIds.map((surfaceId) => {
      const current = modelSurfacesPolygonAttribute(modelId, surfaceId);
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
          polygon_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
    if (!viewer_ids?.length) {
      return;
    }

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids: viewer_ids, name }
    );
  }

  async function setModelSurfacesPolygonAttributeRange(modelId, surfaceIds, minimum, maximum) {
    if (!surfaceIds?.length) {
      return;
    }

    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const updates = surfaceIds.map((surfaceId) => {
      const current = modelSurfacesPolygonAttribute(modelId, surfaceId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: surfaceId,
        values: {
          polygon_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const colorMap = modelSurfacesPolygonAttributeColorMap(modelId, surfaceIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum }
      );
    }
  }

  async function setModelSurfacesPolygonAttributeColorMap(modelId, surfaceIds, colorMap) {
    if (!surfaceIds?.length) {
      return;
    }

    const name = modelSurfacesPolygonAttributeName(modelId, surfaceIds[0]);
    const updates = surfaceIds.map((surfaceId) => {
      const current = modelSurfacesPolygonAttribute(modelId, surfaceId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: surfaceId,
        values: {
          polygon_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const storedConfig = modelSurfacesPolygonAttributeStoredConfig(modelId, surfaceIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, surfaceIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum }
      );
    }
  }

  return {
    modelSurfacesPolygonAttributeName,
    modelSurfacesPolygonAttributeRange,
    modelSurfacesPolygonAttributeColorMap,
    setModelSurfacesPolygonAttributeName,
    setModelSurfacesPolygonAttributeRange,
    setModelSurfacesPolygonAttributeColorMap,
  };
}
