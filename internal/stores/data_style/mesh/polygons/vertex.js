// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useMeshPolygonsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsVertexAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).vertex;
  }

  function meshPolygonsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      const targetItem = item === undefined ? (nameStoredConfigs.lastItem ?? 0) : item;
      nameStoredConfigs.lastItem = targetItem;
      if (targetItem in nameStoredConfigs) {
        return {
          ...nameStoredConfigs[targetItem],
          item: targetItem,
        };
      }
      return {
        minimum: undefined,
        maximum: undefined,
        colorMap: undefined,
        item: targetItem,
      };
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
      item: 0,
    };
  }

  function mutateMeshPolygonsVertexStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolygonsVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolygonsVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshPolygonsVertexAttributeName(id) {
    return meshPolygonsVertexAttribute(id).name;
  }

  function meshPolygonsVertexAttributeItem(id) {
    return meshPolygonsVertexAttribute(id).item;
  }

  function setMeshPolygonsVertexAttributeName(id, name) {
    const targetItem = meshPolygonsVertexAttributeStoredConfig(id, name).item;
    const schema = meshPolygonsVertexAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshPolygonsVertexStyle(id, {
            name,
            item: targetItem,
            storedConfigs: {
              [name]: {
                lastItem: targetItem,
              },
            },
          }),
      },
    );
  }

  function setMeshPolygonsVertexAttributeItem(id, item) {
    const name = meshPolygonsVertexAttributeName(id);
    const schema = meshPolygonsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshPolygonsVertexStyle(id, {
            item,
            storedConfigs: {
              [name]: {
                lastItem: item,
              },
            },
          }),
      },
    );
  }

  function setMeshPolygonsVertexAttribute(id, name, item) {
    const currentName = meshPolygonsVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshPolygonsVertexAttributeName(id, name);
    }
    const currentItem = meshPolygonsVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshPolygonsVertexAttributeItem(id, item);
    }
    return Promise.resolve();
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const colorMap = meshPolygonsVertexAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolygonsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshPolygonsVertexAttributeColorMap(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshPolygonsVertexAttributeColorMap(id, colorMap) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolygonsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeItem,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
  };
}
