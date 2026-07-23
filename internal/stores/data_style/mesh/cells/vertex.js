// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex;

function isMeshCellsVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
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
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
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

  function applyVertexAttribute(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshCellsVertexAttributeValid(attribute)) {
      return setMeshCellsVertexAttribute(id, attribute);
    }
  }

  function meshCellsVertexAttributeName(id) {
    return meshCellsVertexAttribute(id).name;
  }

  function setMeshCellsVertexAttributeName(id, name) {
    const item = meshCellsVertexAttributeLastItem(id, name);
    mutateMeshCellsVertexStyle(id, { name, item });
    return applyVertexAttribute(id);
  }

  function meshCellsVertexAttributeItem(id) {
    const { item, name } = meshCellsVertexAttribute(id);
    return item ?? meshCellsVertexAttributeLastItem(id, name);
  }

  function setMeshCellsVertexAttributeItem(id, item) {
    mutateMeshCellsVertexStyle(id, { item });
    return applyVertexAttribute(id);
  }

  function meshCellsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyVertexAttribute(id);
  }

  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    setMeshCellsVertexAttributeStoredConfig(id, name, item, { colorMap });
    return applyVertexAttribute(id);
  }

  function setMeshCellsVertexAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshCellsVertexStyle(id, { name, item });
    setMeshCellsVertexAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshCellsVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeItem,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  };
}

export { isMeshCellsVertexAttributeValid, useMeshCellsVertexAttributeStyle };
