// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
export function useMeshCellsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsVertexAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).vertex;
  }

  function meshCellsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshCellsVertexStyle(id, values) {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function meshCellsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
  }

  function setMeshCellsVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshCellsVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshCellsVertexAttributeName(id) {
    return meshCellsVertexAttribute(id).name;
  }

  function meshCellsVertexAttributeValue(id) {
    const attr = meshCellsVertexAttribute(id);
    return { name: attr.name, item: attr.item };
  }

  function setMeshCellsVertexAttributeName(id, name, item) {
    const currentName = meshCellsVertexAttributeName(id);
    const targetItem = currentName === name ? item : meshCellsVertexAttributeLastItem(id, name);
    const schema = meshCellsVertexAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          mutateMeshCellsVertexStyle(id, {
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

  function meshCellsVertexAttributeRange(id) {
    const { name, item } = meshCellsVertexAttributeValue(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const { name, item } = meshCellsVertexAttributeValue(id);
    const colorMap = meshCellsVertexAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshCellsVertexAttributeColorMap(id) {
    const { name, item } = meshCellsVertexAttributeValue(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const { name, item } = meshCellsVertexAttributeValue(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshCellsVertexAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, item, { colorMap });
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeValue,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  };
}
