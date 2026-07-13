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

  function mutateMeshPolyhedraVertexStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name][item];
    }
  }

  function meshPolyhedraVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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

  function meshPolyhedraVertexAttributeValue(id) {
    const attr = meshPolyhedraVertexAttribute(id);
    return { name: attr.name, item: attr.item };
  }

  function setMeshPolyhedraVertexAttributeName(id, name, item) {
    const currentName = meshPolyhedraVertexAttributeName(id);
    const targetItem = currentName === name ? item : meshPolyhedraVertexAttributeLastItem(id, name);
    const schema = meshPolyhedraVertexAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          mutateMeshPolyhedraVertexStyle(id, {
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

  function meshPolyhedraVertexAttributeRange(id) {
    const { name, item } = meshPolyhedraVertexAttributeValue(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const { name, item } = meshPolyhedraVertexAttributeValue(id);
    const colorMap = meshPolyhedraVertexAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
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
    const { name, item } = meshPolyhedraVertexAttributeValue(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const { name, item } = meshPolyhedraVertexAttributeValue(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
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
    meshPolyhedraVertexAttributeValue,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
  };
}
