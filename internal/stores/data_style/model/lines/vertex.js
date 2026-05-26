import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex;

export function useModelLinesVertexAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesVertexAttribute(modelId, lineId) {
    const style = dataStyleState.getComponentStyle(modelId, lineId);
    return style.vertex_attribute || { name: undefined, storedConfigs: {} };
  }

  function modelLinesVertexAttributeName(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }

  function modelLinesVertexAttributeStoredConfig(modelId, lineId, name) {
    const attr = modelLinesVertexAttribute(modelId, lineId);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelLinesVertexAttributeRange(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelLinesVertexAttributeColorMap(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name);
    return storedConfig.colorMap;
  }

  async function setModelLinesVertexAttributeName(modelId, lineIds, name) {
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
            const current = modelLinesVertexAttribute(modelId, lineId);
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
                vertex_attribute: updated,
              },
            };
          });
          await modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
        },
      },
    );
  }

  async function setModelLinesVertexAttributeRange(modelId, lineIds, minimum, maximum) {
    if (!lineIds?.length) {
      return;
    }

    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const colorMap = modelLinesVertexAttributeColorMap(modelId, lineIds[0]);
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
              const current = modelLinesVertexAttribute(modelId, lineId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { minimum, maximum } },
              });
              return {
                id_component: lineId,
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

    const updates = lineIds.map((lineId) => {
      const current = modelLinesVertexAttribute(modelId, lineId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { minimum, maximum } },
      });
      return {
        id_component: lineId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
  }

  async function setModelLinesVertexAttributeColorMap(modelId, lineIds, colorMap) {
    if (!lineIds?.length) {
      return;
    }

    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name);
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
              const current = modelLinesVertexAttribute(modelId, lineId);
              const updated = merge({}, current, {
                storedConfigs: { [name]: { colorMap } },
              });
              return {
                id_component: lineId,
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

    const updates = lineIds.map((lineId) => {
      const current = modelLinesVertexAttribute(modelId, lineId);
      const updated = merge({}, current, {
        storedConfigs: { [name]: { colorMap } },
      });
      return {
        id_component: lineId,
        values: {
          vertex_attribute: updated,
        },
      };
    });
    return modelCommonStyle.bulkMutateComponentStylesPerComponent(modelId, updates);
  }

  return {
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    setModelLinesVertexAttributeName,
    setModelLinesVertexAttributeRange,
    setModelLinesVertexAttributeColorMap,
  };
}
