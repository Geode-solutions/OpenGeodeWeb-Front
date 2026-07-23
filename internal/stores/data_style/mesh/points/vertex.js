// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

function isMeshPointsVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPointsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex;
  }

  function meshPointsVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPointsVertexStyle(id, values) {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPointsVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyVertexAttribute(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshPointsVertexAttributeValid(attribute)) {
      return setMeshPointsVertexAttribute(id, attribute);
    }
  }

  function meshPointsVertexAttributeName(id) {
    return meshPointsVertexAttribute(id).name;
  }

  function setMeshPointsVertexAttributeName(id, name) {
    const item = meshPointsVertexAttributeLastItem(id, name);
    mutateMeshPointsVertexStyle(id, { name, item });
    return applyVertexAttribute(id);
  }

  function meshPointsVertexAttributeItem(id) {
    const { item, name } = meshPointsVertexAttribute(id);
    return item ?? meshPointsVertexAttributeLastItem(id, name);
  }

  function setMeshPointsVertexAttributeItem(id, item) {
    mutateMeshPointsVertexStyle(id, { item });
    return applyVertexAttribute(id);
  }

  function meshPointsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    setMeshPointsVertexAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyVertexAttribute(id);
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    setMeshPointsVertexAttributeStoredConfig(id, name, item, { colorMap });
    return applyVertexAttribute(id);
  }

  function setMeshPointsVertexAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshPointsVertexStyle(id, { name, item });
    setMeshPointsVertexAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPointsVertexAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttribute,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeItem,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  };
}

export { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle };
