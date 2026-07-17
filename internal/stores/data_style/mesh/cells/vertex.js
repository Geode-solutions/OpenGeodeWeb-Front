// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex;

function assertMeshCellsVertexAttributeColorConfig({ name, item, minimum, maximum, colorMap }) {
  if (
    name === undefined ||
    item === undefined ||
    minimum === undefined ||
    maximum === undefined ||
    colorMap === undefined
  ) {
    throw new Error("Must provide name, item, minimum, maximum, and colormap");
  }
}

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsVertexAttributeStyle() {
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

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshCellsVertexAttribute(
    id,
    {
      name = meshCellsVertexAttributeName(id),
      item = meshCellsVertexAttributeLastItem(id, name),
      minimum = meshCellsVertexAttributeStoredConfig(id, name, item).minimum ?? 0,
      maximum = meshCellsVertexAttributeStoredConfig(id, name, item).maximum ?? 1,
      colorMap = meshCellsVertexAttributeStoredConfig(id, name, item).colorMap ?? "batlow",
    } = {},
  ) {
    assertMeshCellsVertexAttributeColorConfig({ name, item, minimum, maximum, colorMap });

    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshCellsVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };

    return viewerStore.request(
      { schema, params },
      {
        response_function: () => {
          mutateMeshCellsVertexStyle(id, { name, item });
          setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
        },
      },
    );
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    meshCellsVertexAttributeLastItem,
    setMeshCellsVertexAttribute,
  };
}

export { assertMeshCellsVertexAttributeColorConfig, useMeshCellsVertexAttributeStyle };
