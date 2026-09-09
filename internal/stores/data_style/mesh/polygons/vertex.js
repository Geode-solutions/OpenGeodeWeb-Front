import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
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
      no_data_color: DEFAULT_NO_DATA_COLOR,
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
  function meshPolygonsVertexAttributeName(id) {
    return meshPolygonsVertexAttribute(id).name;
  }
  function meshPolygonsVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }
  function meshPolygonsVertexAttributeItem(id) {
    const { item, name } = meshPolygonsVertexAttribute(id);
    return item ?? meshPolygonsVertexAttributeLastItem(id, name);
  }
  function setMeshPolygonsVertexAttribute(id, { name, item, minimum, maximum, colorMap, no_data = false, no_data_color = DEFAULT_NO_DATA_COLOR }) {
    mutateMeshPolygonsVertexStyle(id, {
      name,
      item,
    });
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshPolygonsVertexAttributeSchemas.attribute;
    const params = {
      id,
      name,
      item,
      points,
      minimum,
      maximum,
      no_data: no_data ?? false,
      no_data_color: no_data_color ?? DEFAULT_NO_DATA_COLOR,
    };
    return viewerStore.request({
      schema,
      params,
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
      no_data: storedConfig.no_data,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsVertexAttributeValid(attribute)) {
      return setMeshPolygonsVertexAttribute(id, attribute);
    }
  }
  function setMeshPolygonsVertexAttributeName(id, name) {
    const item = meshPolygonsVertexAttributeLastItem(id, name);
    mutateMeshPolygonsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  function setMeshPolygonsVertexAttributeItem(id, item) {
    mutateMeshPolygonsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
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
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
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
    setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshPolygonsVertexAttributeNoData(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data ?? false;
  }
  async function setMeshPolygonsVertexAttributeNoData(id, no_data) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data,
    });
    return applyVertexAttribute(id);
  }
  function meshPolygonsVertexAttributeNoDataColor(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color ?? DEFAULT_NO_DATA_COLOR;
  }
  async function setMeshPolygonsVertexAttributeNoDataColor(id, no_data_color) {
    const name = meshPolygonsVertexAttributeName(id);
    const item = meshPolygonsVertexAttributeItem(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name, item);
    await setMeshPolygonsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeItem,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoData,
    setMeshPolygonsVertexAttributeNoData,
    meshPolygonsVertexAttributeNoDataColor,
    setMeshPolygonsVertexAttributeNoDataColor,
  };
}
export { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle };
