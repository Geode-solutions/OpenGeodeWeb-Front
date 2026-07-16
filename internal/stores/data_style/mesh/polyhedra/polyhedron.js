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
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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
    return meshPolyhedraPolyhedronAttribute(id).item;
  }

  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
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
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
    }
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
    return Promise.resolve();
  }

  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    return [minimum, maximum];
  }

  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const colorMap = meshPolyhedraPolyhedronAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig ? storedConfig.colorMap : undefined;
  }

  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { colorMap });
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
