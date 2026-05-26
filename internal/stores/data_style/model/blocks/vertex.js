import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex;

export function useModelBlocksVertexAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksVertexAttribute(modelId, blockId) {
    const style = dataStyleState.getComponentStyle(modelId, blockId);
    return style.vertex_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelBlocksVertexAttributeName(modelId, blockId) {
    return modelBlocksVertexAttribute(modelId, blockId).name;
  }

  function modelBlocksVertexAttributeStoredConfig(modelId, blockId, name) {
    const attr = modelBlocksVertexAttribute(modelId, blockId);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelBlocksVertexAttributeRange(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelBlocksVertexAttributeColorMap(modelId, blockId) {
    const name = modelBlocksVertexAttributeName(modelId, blockId);
    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockId, name);
    return storedConfig.colorMap;
  }

  async function setModelBlocksVertexAttributeName(modelId, blockIds, name) {
    if (!blockIds?.length) {
      return;
    }

    const updates = blockIds.map((blockId) => {
      const current = modelBlocksVertexAttribute(modelId, blockId);
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
        id_component: blockId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    if (!viewer_ids?.length) {
      return;
    }

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids: viewer_ids, name }
    );
  }

  async function setModelBlocksVertexAttributeRange(modelId, blockIds, minimum, maximum) {
    if (!blockIds?.length) {
      return;
    }

    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const updates = blockIds.map((blockId) => {
      const current = modelBlocksVertexAttribute(modelId, blockId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: blockId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const colorMap = modelBlocksVertexAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum }
      );
    }
  }

  async function setModelBlocksVertexAttributeColorMap(modelId, blockIds, colorMap) {
    if (!blockIds?.length) {
      return;
    }

    const name = modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const updates = blockIds.map((blockId) => {
      const current = modelBlocksVertexAttribute(modelId, blockId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: blockId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);

    const storedConfig = modelBlocksVertexAttributeStoredConfig(modelId, blockIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
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
    modelBlocksVertexAttributeName,
    modelBlocksVertexAttributeRange,
    modelBlocksVertexAttributeColorMap,
    setModelBlocksVertexAttributeName,
    setModelBlocksVertexAttributeRange,
    setModelBlocksVertexAttributeColorMap,
  };
}
