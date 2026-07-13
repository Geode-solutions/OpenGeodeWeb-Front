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

  function mutateMeshPolyhedraPolyhedronStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
  }

  function meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function meshPolyhedraPolyhedronAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
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

  function meshPolyhedraPolyhedronAttributeValue(id) {
    const attr = meshPolyhedraPolyhedronAttribute(id);
    return { name: attr.name, item: attr.item };
  }

  function setMeshPolyhedraPolyhedronAttributeName(id, name, item) {
    const currentName = meshPolyhedraPolyhedronAttributeName(id);
    const targetItem =
      currentName === name ? item : meshPolyhedraPolyhedronAttributeLastItem(id, name);
    const schema = meshPolyhedraPolyhedronAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          mutateMeshPolyhedraPolyhedronStyle(id, {
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

  function meshPolyhedraPolyhedronAttributeRange(id) {
    const { name, item } = meshPolyhedraPolyhedronAttributeValue(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const { name, item } = meshPolyhedraPolyhedronAttributeValue(id);
    const colorMap = meshPolyhedraPolyhedronAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
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
    const { name, item } = meshPolyhedraPolyhedronAttributeValue(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const { name, item } = meshPolyhedraPolyhedronAttributeValue(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
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
    meshPolyhedraPolyhedronAttributeValue,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  };
}
