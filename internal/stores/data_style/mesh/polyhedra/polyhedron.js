// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron;

// oxlint-disable-next-line max-lines-per-function
export function useMeshPolyhedraPolyhedronAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).polyhedron;
  }

  function meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateMeshPolyhedraPolyhedronStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
  }

  function setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolyhedraPolyhedronStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshPolyhedraPolyhedronAttributeName(id) {
    return meshPolyhedraPolyhedronAttribute(id).name;
  }

  function meshPolyhedraPolyhedronAttributeItem(id) {
    const polyhedronAttribute = meshPolyhedraPolyhedronAttribute(id);
    return (
      polyhedronAttribute.item ??
      meshPolyhedraPolyhedronAttributeLastItem(id, polyhedronAttribute.name)
    );
  }

  function meshPolyhedraPolyhedronAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const item = meshPolyhedraPolyhedronAttributeLastItem(id, name);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const schema = meshPolyhedraPolyhedronAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshPolyhedraPolyhedronStyle(id, { name, item });
          return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolyhedraPolyhedronAttributeItem(id, item) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const schema = meshPolyhedraPolyhedronAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          mutateMeshPolyhedraPolyhedronStyle(id, { item });
          return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolyhedraPolyhedronAttribute(id, name, item) {
    const currentName = meshPolyhedraPolyhedronAttributeName(id);
    if (name !== currentName) {
      return setMeshPolyhedraPolyhedronAttributeName(id, name);
    }
    const currentItem = meshPolyhedraPolyhedronAttributeItem(id);
    if (item !== currentItem) {
      return setMeshPolyhedraPolyhedronAttributeItem(id, item);
    }
  }

  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const colorMap = meshPolyhedraPolyhedronAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
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

  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
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
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeItem,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  };
}
