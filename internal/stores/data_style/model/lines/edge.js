// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge;

export function useModelLinesEdgeAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesEdgeAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).edge;
  }

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, [lineId], name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateModelLinesEdgeStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      edge: values,
    });
  }

  function setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, config) {
    return mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelLinesEdgeAttributeName(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }

  function modelLinesEdgeAttributeItem(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).item;
  }

  async function setModelLinesEdgeAttributeName(modelId, lineIds, name) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineIds[0]);
    let targetItem = 0;
    let existingConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      targetItem = nameStoredConfigs.lastItem ?? 0;
      existingConfig = nameStoredConfigs[targetItem] ?? {};
    }
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item: targetItem };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesEdgeStyle(modelId, lineIds, { name, item: targetItem });
          return setModelLinesEdgeAttributeStoredConfig(
            modelId,
            lineIds,
            name,
            targetItem,
            existingConfig,
          );
        },
      },
    );
  }

  async function setModelLinesEdgeAttributeItem(modelId, lineIds, item) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineIds[0]);
    let existingConfig = {};
    if (name in storedConfigs) {
      existingConfig = storedConfigs[name][item] ?? {};
    }
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesEdgeStyle(modelId, lineIds, { item });
          return setModelLinesEdgeAttributeStoredConfig(
            modelId,
            lineIds,
            name,
            item,
            existingConfig,
          );
        },
      },
    );
  }

  function setModelLinesEdgeAttribute(modelId, lineIds, name, item) {
    const currentName = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    if (name !== currentName) {
      return setModelLinesEdgeAttributeName(modelId, lineIds, name);
    }
    const currentItem = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    if (item !== currentItem) {
      return setModelLinesEdgeAttributeItem(modelId, lineIds, item);
    }
    return Promise.resolve();
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const colorMap = modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelLinesEdgeAttributeColorMap(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const item = modelLinesEdgeAttributeItem(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const item = modelLinesEdgeAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { colorMap }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, item, { colorMap });
  }

  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeItem,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeItem,
    setModelLinesEdgeAttribute,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}
