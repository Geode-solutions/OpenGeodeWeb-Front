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

  function modelLinesVertexAttributeName(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).name;
  }

  function modelLinesVertexAttributeItem(modelId, lineId) {
    return modelLinesVertexAttribute(modelId, lineId).item;
  }

  async function setModelLinesVertexAttributeName(modelId, lineIds, name) {
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineIds[0]);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name, item };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: () => {
          mutateModelLinesVertexStyle(modelId, lineIds, { name, item });
          return setModelLinesVertexAttributeStoredConfig(
            modelId,
            lineIds,
            name,
            item,
            storedConfig,
          );
        },
      },
    );
  }

  async function setModelLinesVertexAttributeItem(modelId, lineIds, item) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const { storedConfigs } = modelLinesVertexAttribute(modelId, lineIds[0]);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
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
            storedConfig,
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
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    return [minimum, maximum];
  }

  async function setModelLinesVertexAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const colorMap = modelLinesVertexAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

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
    return storedConfig ? storedConfig.colorMap : undefined;
  }

  async function setModelLinesVertexAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesVertexAttributeName(modelId, lineIds[0]);
    const item = modelLinesVertexAttributeItem(modelId, lineIds[0]);
    const storedConfig = modelLinesVertexAttributeStoredConfig(modelId, lineIds[0], name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;

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
