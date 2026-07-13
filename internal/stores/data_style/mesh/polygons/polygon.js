// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

// oxlint-disable-next-line max-lines-per-function
export function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).polygon;
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPolygonsPolygonStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        polygon: values,
      },
    });
  }

  function meshPolygonsPolygonAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolygonsPolygonStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name;
  }

  function meshPolygonsPolygonAttributeValue(id) {
    const attr = meshPolygonsPolygonAttribute(id);
    return { name: attr.name, item: attr.item };
  }

  function setMeshPolygonsPolygonAttributeName(id, name, item) {
    const currentName = meshPolygonsPolygonAttributeName(id);
    const targetItem = currentName === name ? item : meshPolygonsPolygonAttributeLastItem(id, name);
    const schema = meshPolygonsPolygonAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshPolygonsPolygonStyle(id, {
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

  function meshPolygonsPolygonAttributeRange(id) {
    const { name, item } = meshPolygonsPolygonAttributeValue(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const { name, item } = meshPolygonsPolygonAttributeValue(id);
    const colorMap = meshPolygonsPolygonAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolygonsPolygonAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshPolygonsPolygonAttributeColorMap(id) {
    const { name, item } = meshPolygonsPolygonAttributeValue(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshPolygonsPolygonAttributeColorMap(id, colorMap) {
    const { name, item } = meshPolygonsPolygonAttributeValue(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolygonsPolygonAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeValue,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  };
}
