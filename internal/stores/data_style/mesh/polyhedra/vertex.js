// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useMeshPolyhedraVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).vertex;
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateMeshPolyhedraVertexStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshPolyhedraVertexAttributeName(id) {
    return meshPolyhedraVertexAttribute(id).name;
  }

  function meshPolyhedraVertexAttributeItem(id) {
    const vertexAttribute = meshPolyhedraVertexAttribute(id);
    return vertexAttribute.item ?? meshPolyhedraVertexAttributeLastItem(id, vertexAttribute.name);
  }

  function meshPolyhedraVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function setMeshPolyhedraVertexAttributeName(id, name) {
    const item = meshPolyhedraVertexAttributeLastItem(id, name);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const schema = meshPolyhedraVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshPolyhedraVertexStyle(id, { name, item });
          return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolyhedraVertexAttributeItem(id, item) {
    const name = meshPolyhedraVertexAttributeName(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const schema = meshPolyhedraVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshPolyhedraVertexStyle(id, { item });
          return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolyhedraVertexAttribute(id, name, item) {
    const currentName = meshPolyhedraVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshPolyhedraVertexAttributeName(id, name);
    }
    const currentItem = meshPolyhedraVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshPolyhedraVertexAttributeItem(id, item);
    }
  }

  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const colorMap = meshPolyhedraVertexAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraVertexAttributeSchemas.color_map;
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

  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraVertexAttributeSchemas.color_map;
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
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeItem,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
  };
}
