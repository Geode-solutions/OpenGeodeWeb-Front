import { database } from "@ogw_internal/database/database";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import merge from "lodash/merge";

const SCHEMAS = {
  Corner: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex,
  },
  Line: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex,
    edge: viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge,
  },
  Surface: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex,
    polygon: viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon,
  },
  Block: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex,
    polyhedron: viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron,
  },
};

export function useModelAttributeStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const viewerStore = useViewerStore();

  function modelComponentAttribute(modelId, componentId, attrType) {
    const style = dataStyleState.getComponentStyle(modelId, componentId);
    const key = `${attrType}_attribute`;
    return style[key] || { name: undefined, storedConfigs: {} };
  }

  function modelComponentAttributeName(modelId, componentId, attrType) {
    return modelComponentAttribute(modelId, componentId, attrType).name;
  }

  function modelComponentAttributeStoredConfig(modelId, componentId, attrType, name) {
    const attr = modelComponentAttribute(modelId, componentId, attrType);
    if (name && attr.storedConfigs && name in attr.storedConfigs) {
      return attr.storedConfigs[name];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function modelComponentAttributeRange(modelId, componentId, attrType) {
    const name = modelComponentAttributeName(modelId, componentId, attrType);
    const storedConfig = modelComponentAttributeStoredConfig(modelId, componentId, attrType, name);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function modelComponentAttributeColorMap(modelId, componentId, attrType) {
    const name = modelComponentAttributeName(modelId, componentId, attrType);
    const storedConfig = modelComponentAttributeStoredConfig(modelId, componentId, attrType, name);
    return storedConfig.colorMap;
  }

  // Setters

  async function setModelComponentsAttributeName(modelId, componentIds, attrType, type, name) {
    if (!componentIds?.length) return;
    const schema = SCHEMAS[type]?.[attrType];
    if (!schema) return;

    const block_ids = await dataStore.getMeshComponentsViewerIds(modelId, componentIds);
    if (!block_ids?.length) return;

    return viewerStore.request(
      schema.name,
      { id: modelId, block_ids, name },
      {
        response_function: async () => {
          await database.transaction("rw", database.model_component_datastyle, async () => {
            for (const componentId of componentIds) {
              const current = modelComponentAttribute(modelId, componentId, attrType);
              const updates = { name };
              if (!(name in current.storedConfigs)) {
                updates.storedConfigs = {
                  [name]: {
                    minimum: undefined,
                    maximum: undefined,
                    colorMap: undefined,
                  },
                };
              }
              const updated = merge({}, current, updates);
              await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
                [`${attrType}_attribute`]: updated,
              });
            }
          });
        },
      },
    );
  }

  async function setModelComponentsAttributeRange(modelId, componentIds, attrType, type, minimum, maximum) {
    if (!componentIds?.length) return;
    const schema = SCHEMAS[type]?.[attrType];
    if (!schema) return;

    const block_ids = await dataStore.getMeshComponentsViewerIds(modelId, componentIds);
    if (!block_ids?.length) return;

    const name = modelComponentAttributeName(modelId, componentIds[0], attrType);
    const colorMap = modelComponentAttributeColorMap(modelId, componentIds[0], attrType);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids, points, minimum, maximum },
        {
          response_function: async () => {
            await database.transaction("rw", database.model_component_datastyle, async () => {
              for (const componentId of componentIds) {
                const current = modelComponentAttribute(modelId, componentId, attrType);
                const config = current.storedConfigs[name] || {};
                config.minimum = minimum;
                config.maximum = maximum;
                const updated = merge({}, current, {
                  storedConfigs: { [name]: config },
                });
                await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
                  [`${attrType}_attribute`]: updated,
                });
              }
            });
          },
        },
      );
    } else {
      await database.transaction("rw", database.model_component_datastyle, async () => {
        for (const componentId of componentIds) {
          const current = modelComponentAttribute(modelId, componentId, attrType);
          const config = current.storedConfigs[name] || {};
          config.minimum = minimum;
          config.maximum = maximum;
          const updated = merge({}, current, {
            storedConfigs: { [name]: config },
          });
          await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
            [`${attrType}_attribute`]: updated,
          });
        }
      });
    }
  }

  async function setModelComponentsAttributeColorMap(modelId, componentIds, attrType, type, colorMap) {
    if (!componentIds?.length) return;
    const schema = SCHEMAS[type]?.[attrType];
    if (!schema) return;

    const block_ids = await dataStore.getMeshComponentsViewerIds(modelId, componentIds);
    if (!block_ids?.length) return;

    const name = modelComponentAttributeName(modelId, componentIds[0], attrType);
    const [minimum, maximum] = modelComponentAttributeRange(modelId, componentIds[0], attrType);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids, points, minimum, maximum },
        {
          response_function: async () => {
            await database.transaction("rw", database.model_component_datastyle, async () => {
              for (const componentId of componentIds) {
                const current = modelComponentAttribute(modelId, componentId, attrType);
                const config = current.storedConfigs[name] || {};
                config.colorMap = colorMap;
                const updated = merge({}, current, {
                  storedConfigs: { [name]: config },
                });
                await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
                  [`${attrType}_attribute`]: updated,
                });
              }
            });
          },
        },
      );
    } else {
      await database.transaction("rw", database.model_component_datastyle, async () => {
        for (const componentId of componentIds) {
          const current = modelComponentAttribute(modelId, componentId, attrType);
          const config = current.storedConfigs[name] || {};
          config.colorMap = colorMap;
          const updated = merge({}, current, {
            storedConfigs: { [name]: config },
          });
          await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
            [`${attrType}_attribute`]: updated,
          });
        }
      });
    }
  }

  return {
    modelComponentAttributeName,
    modelComponentAttributeRange,
    modelComponentAttributeColorMap,
    setModelComponentsAttributeName,
    setModelComponentsAttributeRange,
    setModelComponentsAttributeColorMap,
  };
}
