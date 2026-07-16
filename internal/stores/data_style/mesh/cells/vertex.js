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

  function meshCellsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function meshCellsVertexAttributeName(id) {
    return meshCellsVertexAttribute(id).name;
  }

  function meshCellsVertexAttributeItem(id) {
    return meshCellsVertexAttribute(id).item;
  }

  function setMeshCellsVertexAttributeName(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    let item = 0;
    let storedConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      item = nameStoredConfigs.lastItem ?? 0;
      storedConfig = nameStoredConfigs[item] ?? {};
    }
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
    const { storedConfigs } = meshCellsVertexAttribute(id);
    let storedConfig = {};
    if (name in storedConfigs) {
      storedConfig = storedConfigs[name][item] ?? {};
    }
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
    return Promise.resolve();
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
