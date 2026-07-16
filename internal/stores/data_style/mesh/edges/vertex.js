// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useMeshEdgesVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }

  function meshEdgesVertexAttribute(id) {
    return meshEdgesColoring(id).vertex;
  }

  function meshEdgesVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateMeshEdgesVertexStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshEdgesVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshEdgesVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshEdgesVertexAttributeName(id) {
    return meshEdgesVertexAttribute(id).name;
  }

  function meshEdgesVertexAttributeItem(id) {
    return meshEdgesVertexAttribute(id).item;
  }

  function setMeshEdgesVertexAttributeName(id, name) {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
    const schema = meshEdgesVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshEdgesVertexStyle(id, { name, item });
          return setMeshEdgesVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshEdgesVertexAttributeItem(id, item) {
    const name = meshEdgesVertexAttributeName(id);
    const { storedConfigs } = meshEdgesVertexAttribute(id);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
    }
    const schema = meshEdgesVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshEdgesVertexStyle(id, { item });
          return setMeshEdgesVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshEdgesVertexAttribute(id, name, item) {
    const currentName = meshEdgesVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshEdgesVertexAttributeName(id, name);
    }
    const currentItem = meshEdgesVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshEdgesVertexAttributeItem(id, item);
    }
    return Promise.resolve();
  }

  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    return [minimum, maximum];
  }

  function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const colorMap = meshEdgesVertexAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshEdgesVertexAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  // oxlint-disable-next-line duplicate-exports
  function meshEdgesVertexAttributeColorMap(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig ? storedConfig.colorMap : undefined;
  }

  function setMeshEdgesVertexAttributeColorMap(id, colorMap) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshEdgesVertexAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeItem,
    setMeshEdgesVertexAttribute,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
  };
}
