// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex;

export function useModelLinesVertexAttribute() {
  const dataStore = useDataStore();
  const modelLinesCommonStyle = useModelLinesCommonStyle();
  const viewerStore = useViewerStore();

  function modelLinesVertexAttribute(modelId, lineId) {
    return modelLinesCommonStyle.modelLineColoring(modelId, lineId).vertex;
  }

  function modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineId);
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setModelLinesVertexAttributeStoredConfig(modelId, [lineId], name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateModelLinesVertexStyle(modelId, lineIds, values) {
    return modelLinesCommonStyle.mutateModelLinesColoring(modelId, lineIds, {
      vertex: values,
    });
  }

  function setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, config) {
    return mutateModelLinesVertexStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function modelLinesVertexAttributeName(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }

  function modelLinesVertexAttributeItem(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).item;
  }

  async function setModelLinesVertexAttributeName(modelId, lineIds, name) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineIds[0]);
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
          mutateModelLinesVertexStyle(modelId, lineIds, { name, item: targetItem });
          return setModelLinesVertexAttributeStoredConfig(
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

  async function setModelLinesVertexAttributeItem(modelId, lineIds, item) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineIds[0]);
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
          mutateModelLinesVertexStyle(modelId, lineIds, { item });
          return setModelLinesVertexAttributeStoredConfig(
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

  function setModelLinesVertexAttribute(modelId, lineIds, name, item) {
    const currentName = modelLinesVertexAttributeName(modelId, lineIds[0]);
    if (name !== currentName) {
      return setModelLinesVertexAttributeName(modelId, lineIds, name);
    }
    const currentItem = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    if (item !== currentItem) {
      return setModelLinesVertexAttributeItem(modelId, lineIds, item);
    }
    return Promise.resolve();
  }

  function modelLinesVertexAttributeRange(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  async function setModelLinesVertexAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const colorMap = modelLinesVertexAttributeColorMap(modelId, lineIds[0]);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, {
      minimum,
      maximum,
    });
  }

  function modelLinesVertexAttributeColorMap(modelId, lineId) {
    const name = modelLinesVertexAttributeName(modelId, lineId);
    const item = modelLinesVertexAttributeItem(modelId, lineId);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineId, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  async function setModelLinesVertexAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
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
            setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, { colorMap }),
        },
      );
    }
    return setModelLinesVertexAttributeStoredConfig(modelId, lineIds, name, item, { colorMap });
  }

  return {
    modelLinesVertexAttributeName,
    modelLinesVertexAttributeItem,
    modelLinesVertexAttributeRange,
    modelLinesVertexAttributeColorMap,
    modelLinesVertexAttributeStoredConfig,
    setModelLinesVertexAttributeName,
    setModelLinesVertexAttributeItem,
    setModelLinesVertexAttribute,
    setModelLinesVertexAttributeRange,
    setModelLinesVertexAttributeColorMap,
  };
}
