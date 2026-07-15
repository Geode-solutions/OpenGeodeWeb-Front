// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

// oxlint-disable-next-line max-lines-per-function
export function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesColoring(id).edge;
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
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

  function mutateMeshEdgesEdgeStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
  }

  function setMeshEdgesEdgeAttributeStoredConfig(id, name, item, config) {
    return mutateMeshEdgesEdgeStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshEdgesEdgeAttributeName(id) {
    return meshEdgesEdgeAttribute(id).name;
  }

  function meshEdgesEdgeAttributeItem(id) {
    return meshEdgesEdgeAttribute(id).item;
  }

  function setMeshEdgesEdgeAttributeName(id, name) {
    const targetItem = meshEdgesEdgeAttributeStoredConfig(id, name).item;
    const schema = meshEdgesEdgeAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          mutateMeshEdgesEdgeStyle(id, {
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

  function setMeshEdgesEdgeAttributeItem(id, item) {
    const name = meshEdgesEdgeAttributeName(id);
    const schema = meshEdgesEdgeAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          mutateMeshEdgesEdgeStyle(id, {
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

  function setMeshEdgesEdgeAttribute(id, { name, item }) {
    const currentName = meshEdgesEdgeAttributeName(id);
    if (name !== currentName) {
      return setMeshEdgesEdgeAttributeName(id, name);
    }
    const currentItem = meshEdgesEdgeAttributeItem(id);
    if (item !== currentItem) {
      return setMeshEdgesEdgeAttributeItem(id, item);
    }
    return Promise.resolve();
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const colorMap = meshEdgesEdgeAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesEdgeAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshEdgesEdgeAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeItem,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  };
}
