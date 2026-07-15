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

  function mutateMeshPointsVertexStyle(id, values) {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function meshPointsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function meshPointsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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
    return meshPointsVertexAttribute(id).item;
  }

  function setMeshPointsVertexAttributeName(id, name) {
    const targetItem = meshPointsVertexAttributeLastItem(id, name);
    const schema = meshPointsVertexAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshPointsVertexStyle(id, {
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

  function setMeshPointsVertexAttributeItem(id, item) {
    const name = meshPointsVertexAttributeName(id);
    const schema = meshPointsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshPointsVertexStyle(id, {
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

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  // oxlint-disable-next-line duplicate-exports
  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const colorMap = meshPointsVertexAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPointsVertexAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPointsVertexAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeItem,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  };
}
