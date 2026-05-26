import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex;

export function useModelCornersVertexAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelCornersVertexAttribute(modelId, cornerId) {
    const style = dataStyleState.getComponentStyle(modelId, cornerId);
    return style.vertex_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelCornersVertexAttributeName(modelId, cornerId) {
    return modelCornersVertexAttribute(modelId, cornerId).name;
  }

  function modelCornersVertexAttributeStoredConfig(modelId, cornerId, name) {
    const attr = modelCornersVertexAttribute(modelId, cornerId);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelCornersVertexAttributeRange(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelCornersVertexAttributeColorMap(modelId, cornerId) {
    const name = modelCornersVertexAttributeName(modelId, cornerId);
    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerId, name);
    return storedConfig.colorMap;
  }

  async function setModelCornersVertexAttributeName(modelId, cornerIds, name) {
    if (!cornerIds?.length) {
      return;
    }

    const updates = cornerIds.map((cornerId) => {
      const current = modelCornersVertexAttribute(modelId, cornerId);
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
        id_component: cornerId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
    if (!viewer_ids?.length) {
      return;
    }

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids: viewer_ids, name }
    );
  }

  async function setModelCornersVertexAttributeRange(modelId, cornerIds, minimum, maximum) {
    if (!cornerIds?.length) {
      return;
    }

    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const updates = cornerIds.map((cornerId) => {
      const current = modelCornersVertexAttribute(modelId, cornerId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: cornerId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const colorMap = modelCornersVertexAttributeColorMap(modelId, cornerIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum }
      );
    }
  }

  async function setModelCornersVertexAttributeColorMap(modelId, cornerIds, colorMap) {
    if (!cornerIds?.length) {
      return;
    }

    const name = modelCornersVertexAttributeName(modelId, cornerIds[0]);
    const updates = cornerIds.map((cornerId) => {
      const current = modelCornersVertexAttribute(modelId, cornerId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: cornerId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const storedConfig = modelCornersVertexAttributeStoredConfig(modelId, cornerIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, cornerIds);
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
    modelCornersVertexAttributeName,
    modelCornersVertexAttributeRange,
    modelCornersVertexAttributeColorMap,
    setModelCornersVertexAttributeName,
    setModelCornersVertexAttributeRange,
    setModelCornersVertexAttributeColorMap,
  };
}
