// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

function isMeshEdgesEdgeAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesColoring(id).edge;
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshEdgesEdgeStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
  }

  function setMeshEdgesEdgeAttributeStoredConfig(id, name, item, config) {
    return mutateMeshEdgesEdgeStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyEdgeAttribute(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshEdgesEdgeAttributeValid(attribute)) {
      return setMeshEdgesEdgeAttribute(id, attribute);
    }
  }

  function meshEdgesEdgeAttributeName(id) {
    return meshEdgesEdgeAttribute(id).name;
  }

  function setMeshEdgesEdgeAttributeName(id, name) {
    const item = meshEdgesEdgeAttributeLastItem(id, name);
    mutateMeshEdgesEdgeStyle(id, { name, item });
    return applyEdgeAttribute(id);
  }

  function meshEdgesEdgeAttributeItem(id) {
    const { item, name } = meshEdgesEdgeAttribute(id);
    return item ?? meshEdgesEdgeAttributeLastItem(id, name);
  }

  function setMeshEdgesEdgeAttributeItem(id, item) {
    mutateMeshEdgesEdgeStyle(id, { item });
    return applyEdgeAttribute(id);
  }

  function meshEdgesEdgeAttributeLastItem(id, name) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyEdgeAttribute(id);
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { colorMap });
    return applyEdgeAttribute(id);
  }

  function setMeshEdgesEdgeAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshEdgesEdgeStyle(id, { name, item });
    setMeshEdgesEdgeAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshEdgesEdgeAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    meshEdgesEdgeAttributeLastItem,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeItem,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  };
}

export { isMeshEdgesEdgeAttributeValid, useMeshEdgesEdgeAttributeStyle };
