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

  function isMeshCellsVertexAttributeConfigured(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const { colorMap, minimum, maximum } = meshCellsVertexAttributeStoredConfig(id, name, item);
    return colorMap !== undefined && minimum !== undefined && maximum !== undefined;
  }

  function applyMeshCellsVertexAttribute(id) {
    if (!isMeshCellsVertexAttributeConfigured(id)) {
      return;
    }
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const colorMap = meshCellsVertexAttributeColorMap(id);
    const [minimum, maximum] = meshCellsVertexAttributeRange(id);
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshCellsVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  function setMeshCellsVertexAttributeName(
    id,
    name,
    item = meshCellsVertexAttributeLastItem(id, name),
  ) {
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    mutateMeshCellsVertexStyle(id, { name, item });
    setMeshCellsVertexAttributeStoredConfig(id, name, item, storedConfig);
    return applyMeshCellsVertexAttribute(id);
  }

  function setMeshCellsVertexAttributeItem(id, item) {
    const name = meshCellsVertexAttributeName(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    mutateMeshCellsVertexStyle(id, { item });
    setMeshCellsVertexAttributeStoredConfig(id, name, item, storedConfig);
    return applyMeshCellsVertexAttribute(id);
  }

  function setMeshCellsVertexAttribute(id, name, item) {
    const currentName = meshCellsVertexAttributeName(id);
    if (name !== currentName) {
      return setMeshCellsVertexAttributeName(id, name, item);
    }
    const currentItem = meshCellsVertexAttributeItem(id);
    if (item !== currentItem) {
      return setMeshCellsVertexAttributeItem(id, item);
    }
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, { ...storedConfig, minimum, maximum });
    return applyMeshCellsVertexAttribute(id);
  }

  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, { ...storedConfig, colorMap });
    return applyMeshCellsVertexAttribute(id);
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    isMeshCellsVertexAttributeConfigured,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeItem,
    setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  };
}
