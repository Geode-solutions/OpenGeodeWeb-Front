// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron;

export function useModelBlocksPolyhedronAttribute() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksPolyhedronAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockColoring(modelId, blockId).polyhedron;
  }

  function modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function mutateModelBlocksPolyhedronStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      polyhedron: values,
    });
  }

  function modelBlocksPolyhedronAttributeLastItem(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
  }

  function setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, config) {
    return mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelBlocksPolyhedronAttributeName(modelId, blockId) {
    return modelBlocksPolyhedronAttribute(modelId, blockId).name;
  }

  function modelBlocksPolyhedronAttributeValue(modelId, blockId) {
    const attr = modelBlocksPolyhedronAttribute(modelId, blockId);
    return { name: attr.name, item: attr.item };
  }

  async function setModelBlocksPolyhedronAttributeName(modelId, blockIds, name, item) {
    const currentName = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const targetItem =
      currentName === name
        ? item
        : modelBlocksPolyhedronAttributeLastItem(modelId, blockIds[0], name);
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () =>
          mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
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

  function modelBlocksPolyhedronAttributeRange(modelId, blockId) {
    const { name, item } = modelBlocksPolyhedronAttributeValue(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelBlocksPolyhedronAttributeRange(modelId, blockIds, minimum, maximum) {
    const { name, item } = modelBlocksPolyhedronAttributeValue(modelId, blockIds[0]);
    const colorMap = modelBlocksPolyhedronAttributeColorMap(modelId, blockIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelBlocksPolyhedronAttributeColorMap(modelId, blockId) {
    const { name, item } = modelBlocksPolyhedronAttributeValue(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelBlocksPolyhedronAttributeColorMap(modelId, blockIds, colorMap) {
    const { name, item } = modelBlocksPolyhedronAttributeValue(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(
      modelId,
      blockIds[0],
      name,
      item,
    );
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
              colorMap,
            }),
        },
      );
    }
    return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, item, {
      colorMap,
    });
  }

  return {
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeValue,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeStoredConfig,
    setModelBlocksPolyhedronAttributeName,
    setModelBlocksPolyhedronAttributeRange,
    setModelBlocksPolyhedronAttributeColorMap,
  };
}
