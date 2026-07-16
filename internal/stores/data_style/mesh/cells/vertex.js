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
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshCellsVertexAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function mutateMeshCellsVertexStyle(id, values) {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
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

  function meshCellsVertexAttributeItem(id) {
    const vertexAttribute = meshCellsVertexAttribute(id);
    return vertexAttribute.item ?? meshCellsVertexAttributeLastItem(id, vertexAttribute.name);
  }

  function meshCellsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function setMeshCellsVertexAttributeName(id, name) {
    const item = meshCellsVertexAttributeLastItem(id, name);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const schema = meshCellsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshCellsVertexStyle(id, { name, item });
          return setMeshCellsVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshCellsVertexAttributeItem(id, item) {
    const name = meshCellsVertexAttributeName(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const schema = meshCellsVertexAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshCellsVertexStyle(id, { item });
          return setMeshCellsVertexAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshCellsVertexAttribute(id, name, item) {
    const currentName = meshCellsVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshCellsVertexAttributeName(id, name);
    }
    const currentItem = meshCellsVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshCellsVertexAttributeItem(id, item);
    }
  }

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const colorMap = meshCellsVertexAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshCellsVertexAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeItem,
    setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  };
}
