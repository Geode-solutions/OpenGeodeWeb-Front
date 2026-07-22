// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

function isMeshPolyhedraVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraColoring(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).coloring;
  }

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraColoring(id).vertex;
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPolyhedraVertexStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyVertexAttribute(id) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshPolyhedraVertexAttributeValid(attribute)) {
      return setMeshPolyhedraVertexAttribute(id, attribute);
    }
  }

  function meshPolyhedraVertexAttributeName(id) {
    return meshPolyhedraVertexAttribute(id).name;
  }

  function setMeshPolyhedraVertexAttributeName(id, name) {
    const item = meshPolyhedraVertexAttributeLastItem(id, name);
    mutateMeshPolyhedraVertexStyle(id, { name, item });
    return applyVertexAttribute(id);
  }

  function meshPolyhedraVertexAttributeItem(id) {
    const { item, name } = meshPolyhedraVertexAttribute(id);
    return item ?? meshPolyhedraVertexAttributeLastItem(id, name);
  }

  function setMeshPolyhedraVertexAttributeItem(id, item) {
    mutateMeshPolyhedraVertexStyle(id, { item });
    return applyVertexAttribute(id);
  }

  function meshPolyhedraVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyVertexAttribute(id);
  }

  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { colorMap });
    return applyVertexAttribute(id);
  }

  function setMeshPolyhedraVertexAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshPolyhedraVertexStyle(id, { name, item });
    setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPolyhedraVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeItem,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
  };
}

export { isMeshPolyhedraVertexAttributeValid, useMeshPolyhedraVertexAttributeStyle };
