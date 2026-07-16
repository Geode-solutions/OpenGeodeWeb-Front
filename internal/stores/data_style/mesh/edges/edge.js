// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

// oxlint-disable-next-line max-lines-per-function
export function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesColoring(id).edge;
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateMeshEdgesEdgeStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
  }

  function setMeshEdgesEdgeAttributeStoredConfig(id, name, item, config) {
    return mutateMeshEdgesEdgeStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshEdgesEdgeAttributeName(id) {
    return meshEdgesEdgeAttribute(id).name;
  }

  function meshEdgesEdgeAttributeItem(id) {
    const edgeAttribute = meshEdgesEdgeAttribute(id);
    return edgeAttribute.item ?? meshEdgesEdgeAttributeLastItem(id, edgeAttribute.name);
  }

  function meshEdgesEdgeAttributeLastItem(id, name) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function setMeshEdgesEdgeAttributeName(id, name) {
    const item = meshEdgesEdgeAttributeLastItem(id, name);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const schema = meshEdgesEdgeAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshEdgesEdgeStyle(id, { name, item });
          return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshEdgesEdgeAttributeItem(id, item) {
    const name = meshEdgesEdgeAttributeName(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const schema = meshEdgesEdgeAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshEdgesEdgeStyle(id, { item });
          return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshEdgesEdgeAttribute(id, name, item) {
    const currentName = meshEdgesEdgeAttributeName(id);
    if (name !== currentName) {
      return setMeshEdgesEdgeAttributeName(id, name);
    }
    const currentItem = meshEdgesEdgeAttributeItem(id);
    if (item !== currentItem) {
      return setMeshEdgesEdgeAttributeItem(id, item);
    }
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const colorMap = meshEdgesEdgeAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesEdgeAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesEdgeAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeItem,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  };
}
