// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

function isMeshPolygonsVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsColoring(id) {
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).coloring;
  }

  function meshPolygonsVertexAttribute(id) {
    return meshPolygonsColoring(id).vertex;
  }

  function meshPolygonsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPolygonsVertexStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolygonsVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolygonsVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyVertexAttribute(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshPolygonsVertexAttributeValid(attribute)) {
      return setMeshPolygonsVertexAttribute(id, attribute);
    }
  }

  function meshPolygonsVertexAttributeName(id) {
    return meshPolygonsVertexAttribute(id).name;
  }

  function setMeshPolygonsVertexAttributeName(id, name) {
    const item = meshPolygonsVertexAttributeLastItem(id, name);
    mutateMeshPolygonsVertexStyle(id, { name, item });
    return applyVertexAttribute(id);
  }

  function meshPolygonsVertexAttributeItem(id) {
    const { item, name } = meshPolygonsVertexAttribute(id);
    return item ?? meshPolygonsVertexAttributeLastItem(id, name);
  }

  function setMeshPolygonsVertexAttributeItem(id, item) {
    mutateMeshPolygonsVertexStyle(id, { item });
    return applyVertexAttribute(id);
  }

  function meshPolygonsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyVertexAttribute(id);
  }

  function meshPolygonsVertexAttributeColorMap(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshPolygonsVertexAttributeColorMap(id, colorMap) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { colorMap });
    return applyVertexAttribute(id);
  }

  function setMeshPolygonsVertexAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshPolygonsVertexStyle(id, { name, item });
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPolygonsVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeItem,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
  };
}

export { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle };
