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
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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

  // oxlint-disable-next-line duplicate-exports
  function meshPolyhedraVertexAttributeName(id) {
    return meshPolyhedraVertexAttribute(id).name;
  }

  function meshPolyhedraVertexAttributeItem(id) {
    return meshPolyhedraVertexAttribute(id).item;
  }

  function setMeshPolyhedraVertexAttributeName(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
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
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
    }
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
    return Promise.resolve();
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
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
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
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { colorMap });
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
