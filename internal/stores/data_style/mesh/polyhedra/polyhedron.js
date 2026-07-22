// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron;

function isMeshPolyhedraPolyhedronAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraPolyhedronAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraColoring(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).coloring;
  }

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraColoring(id).polyhedron;
  }

  function meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPolyhedraPolyhedronStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
  }

  function setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolyhedraPolyhedronStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyPolyhedronAttribute(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshPolyhedraPolyhedronAttributeValid(attribute)) {
      return setMeshPolyhedraPolyhedronAttribute(id, attribute);
    }
  }

  function meshPolyhedraPolyhedronAttributeName(id) {
    return meshPolyhedraPolyhedronAttribute(id).name;
  }

  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const item = meshPolyhedraPolyhedronAttributeLastItem(id, name);
    mutateMeshPolyhedraPolyhedronStyle(id, { name, item });
    return applyPolyhedronAttribute(id);
  }

  function meshPolyhedraPolyhedronAttributeItem(id) {
    const { item, name } = meshPolyhedraPolyhedronAttribute(id);
    return item ?? meshPolyhedraPolyhedronAttributeLastItem(id, name);
  }

  function setMeshPolyhedraPolyhedronAttributeItem(id, item) {
    mutateMeshPolyhedraPolyhedronStyle(id, { item });
    return applyPolyhedronAttribute(id);
  }

  function meshPolyhedraPolyhedronAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyPolyhedronAttribute(id);
  }

  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { colorMap });
    return applyPolyhedronAttribute(id);
  }

  function setMeshPolyhedraPolyhedronAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshPolyhedraPolyhedronStyle(id, { name, item });
    setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPolyhedraPolyhedronAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    meshPolyhedraPolyhedronAttributeLastItem,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeItem,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  };
}

export { isMeshPolyhedraPolyhedronAttributeValid, useMeshPolyhedraPolyhedronAttributeStyle };
