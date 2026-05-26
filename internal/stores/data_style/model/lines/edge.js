import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge;

export function useModelLinesEdgeAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesEdgeAttribute(modelId, lineId) {
    const style = dataStyleState.getComponentStyle(modelId, lineId);
    return style.edge_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelLinesEdgeAttributeName(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name) {
    const attr = modelLinesEdgeAttribute(modelId, lineId);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelLinesEdgeAttributeColorMap(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name);
    return storedConfig.colorMap;
  }

  async function setModelLinesEdgeAttributeName(modelId, lineIds, name) {
    if (!lineIds?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    if (!viewer_ids?.length) {
      return;
    }

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids: viewer_ids, name },
      {
        response_function: async () => {
          const updates = lineIds.map((lineId) => {
            const current = modelLinesEdgeAttribute(modelId, lineId);
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
              id_component: lineId,
              values: {
                edge_attribute: updated,
              },
            };
          });
          await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
        },
      },
    );
  }

  async function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    if (!lineIds?.length) {
      return;
    }

    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const colorMap = modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
        {
          response_function: async () => {
            const updates = lineIds.map((lineId) => {
              const current = modelLinesEdgeAttribute(modelId, lineId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { minimum, maximum } },
              });
              return {
                id_component: lineId,
                values: {
                  edge_attribute: updated,
                },
              };
            });
            await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
          },
        },
      );
    }

    const updates = lineIds.map((lineId) => {
      const current = modelLinesEdgeAttribute(modelId, lineId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: lineId,
        values: {
          edge_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
  }

  async function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    if (!lineIds?.length) {
      return;
    }

    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
        {
          response_function: async () => {
            const updates = lineIds.map((lineId) => {
              const current = modelLinesEdgeAttribute(modelId, lineId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { colorMap } },
              });
              return {
                id_component: lineId,
                values: {
                  edge_attribute: updated,
                },
              };
            });
            await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
          },
        },
      );
    }

    const updates = lineIds.map((lineId) => {
      const current = modelLinesEdgeAttribute(modelId, lineId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: lineId,
        values: {
          edge_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
  }

  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}
