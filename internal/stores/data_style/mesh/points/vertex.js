// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useMeshPointsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex;
  }

  function meshPointsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshPointsVertexAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateMeshPointsVertexStyle(id, values) {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPointsVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshPointsVertexAttributeName(id) {
    return meshPointsVertexAttribute(id).name;
  }

  function meshPointsVertexAttributeItem(id) {
    const vertexAttribute = meshPointsVertexAttribute(id);
    return vertexAttribute.item ?? meshPointsVertexAttributeLastItem(id, vertexAttribute.name);
  }

  function meshPointsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function setMeshPointsVertexAttributeName(id, name) {
    const item = meshPointsVertexAttributeLastItem(id, name);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const schema = meshPointsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshPointsVertexStyle(id, { name, item });
          return setMeshPointsVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPointsVertexAttributeItem(id, item) {
    const name = meshPointsVertexAttributeName(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const schema = meshPointsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshPointsVertexStyle(id, { item });
          return setMeshPointsVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPointsVertexAttribute(id, name, item) {
    const currentName = meshPointsVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshPointsVertexAttributeName(id, name);
    }
    const currentItem = meshPointsVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshPointsVertexAttributeItem(id, item);
    }
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const colorMap = meshPointsVertexAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshPointsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
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

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshPointsVertexAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
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
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeItem,
    setMeshPointsVertexAttribute,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  };
}
