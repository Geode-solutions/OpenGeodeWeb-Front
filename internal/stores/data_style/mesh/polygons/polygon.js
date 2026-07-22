// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

function isMeshPolygonsPolygonAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsColoring(id) {
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).coloring;
  }

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsColoring(id).polygon;
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshPolygonsPolygonStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        polygon: values,
      },
    });
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, config) {
    return mutateMeshPolygonsPolygonStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyPolygonAttribute(id) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshPolygonsPolygonAttributeValid(attribute)) {
      return setMeshPolygonsPolygonAttribute(id, attribute);
    }
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name;
  }

  function setMeshPolygonsPolygonAttributeName(id, name) {
    const item = meshPolygonsPolygonAttributeLastItem(id, name);
    mutateMeshPolygonsPolygonStyle(id, { name, item });
    return applyPolygonAttribute(id);
  }

  function meshPolygonsPolygonAttributeItem(id) {
    const { item, name } = meshPolygonsPolygonAttribute(id);
    return item ?? meshPolygonsPolygonAttributeLastItem(id, name);
  }

  function setMeshPolygonsPolygonAttributeItem(id, item) {
    mutateMeshPolygonsPolygonStyle(id, { item });
    return applyPolygonAttribute(id);
  }

  function meshPolygonsPolygonAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshPolygonsPolygonAttributeRange(id) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyPolygonAttribute(id);
  }

  function meshPolygonsPolygonAttributeColorMap(id) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshPolygonsPolygonAttributeColorMap(id, colorMap) {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { colorMap });
    return applyPolygonAttribute(id);
  }

  function setMeshPolygonsPolygonAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshPolygonsPolygonStyle(id, { name, item });
    setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPolygonsPolygonAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  };
}

export { isMeshPolygonsPolygonAttributeValid, useMeshPolygonsPolygonAttributeStyle };
