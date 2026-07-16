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
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateMeshPolygonsPolygonStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        polygon: values,
      },
    });
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

  function meshPolygonsPolygonAttributeItem(id) {
    return meshPolygonsPolygonAttribute(id).item;
  }

  function setMeshPolygonsPolygonAttributeName(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
    const schema = meshPolygonsPolygonAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshPolygonsPolygonStyle(id, { name, item });
          return setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolygonsPolygonAttributeItem(id, item) {
    const name = meshPolygonsPolygonAttributeName(id);
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
    }
    const schema = meshPolygonsPolygonAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshPolygonsPolygonStyle(id, { item });
          return setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshPolygonsPolygonAttribute(id, name, item) {
    const currentName = meshPolygonsPolygonAttributeName(id);
    if (name !== currentName) {
      return setMeshPolygonsPolygonAttributeName(id, name);
    }
    const currentItem = meshPolygonsPolygonAttributeItem(id);
    if (item !== currentItem) {
      return setMeshPolygonsPolygonAttributeItem(id, item);
    }
    return Promise.resolve();
  }

  function meshPolygonsPolygonAttributeRange(id) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
    return [minimum, maximum];
  }

  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const colorMap = meshPolygonsPolygonAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
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
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig ? storedConfig.colorMap : undefined;
  }

  function setMeshPolygonsPolygonAttributeColorMap(id, colorMap) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig ? storedConfig.minimum : undefined;
    const maximum = storedConfig ? storedConfig.maximum : undefined;
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
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  };
}
