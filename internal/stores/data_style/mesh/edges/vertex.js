import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex;
function isMeshEdgesVertexAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();
  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }
  function meshEdgesVertexAttribute(id) {
    return meshEdgesColoring(id).vertex;
  }
  function meshEdgesVertexAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
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
  function mutateMeshEdgesVertexStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }
  function setMeshEdgesVertexAttributeStoredConfig(id, name, item, config) {
    return mutateMeshEdgesVertexStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }
  function meshEdgesVertexAttributeName(id) {
    return meshEdgesVertexAttribute(id).name;
  }
  function meshEdgesVertexAttributeLastItem(id, name) {
    const { storedConfigs } = meshEdgesVertexAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }
  function meshEdgesVertexAttributeItem(id) {
    const { item, name } = meshEdgesVertexAttribute(id);
    return item ?? meshEdgesVertexAttributeLastItem(id, name);
  }
  function setMeshEdgesVertexAttribute(id, { name, item, minimum, maximum, colorMap, no_data = false, no_data_color = DEFAULT_NO_DATA_COLOR }) {
    mutateMeshEdgesVertexStyle(id, {
      name,
      item,
    });
    setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data,
      no_data_color,
    });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshEdgesVertexAttributeSchemas.attribute;
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
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data: storedConfig.no_data,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshEdgesVertexAttributeValid(attribute)) {
      return setMeshEdgesVertexAttribute(id, attribute);
    }
  }
  function setMeshEdgesVertexAttributeName(id, name) {
    const item = meshEdgesVertexAttributeLastItem(id, name);
    mutateMeshEdgesVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  function setMeshEdgesVertexAttributeItem(id, item) {
    mutateMeshEdgesVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }
  function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeColorMap(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }
  function setMeshEdgesVertexAttributeColorMap(id, colorMap) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeNoData(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data ?? false;
  }
  async function setMeshEdgesVertexAttributeNoData(id, no_data) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data,
    });
    return applyVertexAttribute(id);
  }
  function meshEdgesVertexAttributeNoDataColor(id) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    return storedConfig.no_data_color ?? DEFAULT_NO_DATA_COLOR;
  }
  async function setMeshEdgesVertexAttributeNoDataColor(id, no_data_color) {
    const name = meshEdgesVertexAttributeName(id);
    const item = meshEdgesVertexAttributeItem(id);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name, item);
    await setMeshEdgesVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
  }
  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttribute,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeItem,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeNoData,
    setMeshEdgesVertexAttributeNoData,
    meshEdgesVertexAttributeNoDataColor,
    setMeshEdgesVertexAttributeNoDataColor,
  };
}
export { isMeshEdgesVertexAttributeValid, useMeshEdgesVertexAttributeStyle };
