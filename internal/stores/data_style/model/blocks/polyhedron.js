// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron;

export function useModelBlocksPolyhedronAttributeStyle() {
  const dataStore = useDataStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const viewerStore = useViewerStore();

  function modelBlocksPolyhedronAttribute(modelId, blockId) {
    return modelBlocksCommonStyle.modelBlockStyle(modelId, blockId).polyhedron_attribute;
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
    return modelBlocksCommonStyle.mutateModelBlocksStyle(modelId, blockIds, {
      polyhedron_attribute: values,
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
    if (!blockIds?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
    if (!viewer_ids?.length) {
      return;
    }

    const updates = { name };
    const polyhedron = modelBlocksPolyhedronAttribute(modelId, blockIds[0]);
    if (!(name in polyhedron.storedConfigs)) {
      updates.storedConfigs = {
        [name]: {
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        },
      };
    }
    await mutateModelBlocksPolyhedronStyle(modelId, blockIds, updates);

    return viewerStore.request(schema.name, { id: modelId, block_ids: viewer_ids, name });
  }

  function modelBlocksPolyhedronAttributeRange(modelId, blockId) {
    const name = modelBlocksPolyhedronAttributeName(modelId, blockId);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockId, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelBlocksPolyhedronAttributeRange(modelId, blockIds, minimum, maximum) {
    if (!blockIds?.length) {
      return;
    }

    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const colorMap = modelBlocksPolyhedronAttributeColorMap(modelId, blockIds[0]);
    const points = getRGBPointsFromPreset(colorMap);

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
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
    if (!blockIds?.length) {
      return;
    }

    const name = modelBlocksPolyhedronAttributeName(modelId, blockIds[0]);
    const storedConfig = modelBlocksPolyhedronAttributeStoredConfig(modelId, blockIds[0], name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;

    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const viewer_ids = await dataStore.getMeshComponentsViewerIds(modelId, blockIds);
      if (!viewer_ids?.length) {
        return;
      }
      return viewerStore.request(
        schema.color_map,
        { id: modelId, block_ids: viewer_ids, points, minimum, maximum },
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
