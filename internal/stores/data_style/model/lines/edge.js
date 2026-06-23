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

  function modelLinesEdgeAttributeStoredConfig(modelId, lineId, name) {
    const { storedConfigs } = modelLinesEdgeAttribute(modelId, lineId);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, [lineId], name, {
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

  function setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, config) {
    return mutateModelLinesEdgeStyle(modelId, lineIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelLinesEdgeAttributeName(modelId, lineId) {
    return modelLinesEdgeAttribute(modelId, lineId).name;
  }

  async function setModelLinesEdgeAttributeName(modelId, lineIds, name) {
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: (response) => {
          mutateModelLinesEdgeStyle(modelId, lineIds, { name });
          for (let i = 0; i < lineIds.length; i++) {
            const lineId = lineIds[i];
            const blockRange = response?.[viewer_ids[i]] || {};
            setModelLinesEdgeAttributeStoredConfig(modelId, [lineId], name, {
              minimum: blockRange.minimum,
              maximum: blockRange.maximum,
            });
            setModelLinesEdgeAttributeColorMap(modelId, [lineId], "batlow");
          }
        },
      },
    );
  }

  function modelLinesEdgeAttributeRange(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelLinesEdgeAttributeRange(modelId, lineIds, minimum, maximum) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const colorMap = modelLinesEdgeAttributeColorMap(modelId, lineIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, { minimum, maximum }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, { minimum, maximum });
  }

  function modelLinesEdgeAttributeColorMap(modelId, lineId) {
    const name = modelLinesEdgeAttributeName(modelId, lineId);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelLinesEdgeAttributeColorMap(modelId, lineIds, colorMap) {
    const name = modelLinesEdgeAttributeName(modelId, lineIds[0]);
    const storedConfig = modelLinesEdgeAttributeStoredConfig(modelId, lineIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, lineIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, { colorMap }),
        },
      );
    }
    return setModelLinesEdgeAttributeStoredConfig(modelId, lineIds, name, { colorMap });
  }

  return {
    modelLinesEdgeAttributeName,
    modelLinesEdgeAttributeRange,
    modelLinesEdgeAttributeColorMap,
    modelLinesEdgeAttributeStoredConfig,
    setModelLinesEdgeAttributeName,
    setModelLinesEdgeAttributeRange,
    setModelLinesEdgeAttributeColorMap,
  };
}
