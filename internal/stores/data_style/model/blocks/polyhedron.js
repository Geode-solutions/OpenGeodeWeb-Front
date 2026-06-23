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

  function modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name) {
    const { storedConfigs } = modelBlocksPolyhedronAttribute(modelId, blockId);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setModelBlocksPolyhedronAttributeStoredConfig(modelId, [blockId], name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateModelBlocksPolyhedronStyle(modelId, blockIds, values) {
    return modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blockIds, {
      polyhedron: values,
    });
  }

  function setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, config) {
    return mutateModelBlocksPolyhedronStyle(modelId, blockIds, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelBlocksPolyhedronAttributeName(modelId, blockId) {
    return modelBlocksPolyhedronAttribute(modelId, blockId).name;
  }

  async function setModelBlocksPolyhedronAttributeName(modelId, blockIds, name) {
    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    const params = { id: modelId, block_ids: viewer_ids, name };
    return viewerStore.request(
      { schema: schema.name, params },
      {
        response_function: (response) => {
          mutateModelBlocksPolyhedronStyle(modelId, blockIds, { name });
          for (let i = 0; i < blockIds.length; i++) {
            const blockId = blockIds[i];
            const blockRange = response?.[viewer_ids[i]] || {};
            setModelBlocksPolyhedronAttributeStoredConfig(modelId, [blockId], name, {
              minimum: blockRange.minimum,
              maximum: blockRange.maximum,
            });
            setModelBlocksPolyhedronAttributeColorMap(modelId, [blockId], "batlow");
          }
        },
      },
    );
  }

  function modelBlocksPolyhedronAttributeRange(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelBlocksPolyhedronAttributeRange(modelId, blockIds, minimum, maximum) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const colorMap = modelBlocksPolyhedronAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, {
      minimum,
      maximum,
    });
  }

  function modelBlocksPolyhedronAttributeColorMap(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  async function setModelBlocksPolyhedronAttributeColorMap(modelId, blockIds, colorMap) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      const params = { id: modelId, block_ids: viewer_ids, points, minimum, maximum };
      return viewerStore.request(
        { schema: schema.color_map, params },
        {
          response_function: () =>
            setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, { colorMap }),
        },
      );
    }
    return setModelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds, name, { colorMap });
  }

  return {
    modelBlocksPolyhedronAttributeName,
    modelBlocksPolyhedronAttributeRange,
    modelBlocksPolyhedronAttributeColorMap,
    modelBlocksPolyhedronAttributeStoredConfig,
    setModelBlocksPolyhedronAttributeName,
    setModelBlocksPolyhedronAttributeRange,
    setModelBlocksPolyhedronAttributeColorMap,
  };
}
