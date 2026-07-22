// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsCellAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell;

function isMeshCellsCellAttributeValid({ name, item, minimum, maximum, colorMap }) {
  return (
    name !== undefined &&
    item !== undefined &&
    minimum !== undefined &&
    maximum !== undefined &&
    colorMap !== undefined
  );
}

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsCellAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsCellAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).cell;
  }

  function meshCellsCellAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (storedConfigs && name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    return {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
  }

  function mutateMeshCellsCellStyle(id, values) {
    return meshCellsCommonStyle.mutateMeshCellsStyle(id, {
      coloring: {
        cell: values,
      },
    });
  }

  function setMeshCellsCellAttributeStoredConfig(id, name, item, config) {
    return mutateMeshCellsCellStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function applyCellAttribute(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
    };
    if (isMeshCellsCellAttributeValid(attribute)) {
      return setMeshCellsCellAttribute(id, attribute);
    }
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsCellAttribute(id).name;
  }

  function setMeshCellsCellAttributeName(id, name) {
    const item = meshCellsCellAttributeLastItem(id, name);
    mutateMeshCellsCellStyle(id, { name, item });
    return applyCellAttribute(id);
  }

  function meshCellsCellAttributeItem(id) {
    const { item, name } = meshCellsCellAttribute(id);
    return item ?? meshCellsCellAttributeLastItem(id, name);
  }

  function setMeshCellsCellAttributeItem(id, item) {
    mutateMeshCellsCellStyle(id, { item });
    return applyCellAttribute(id);
  }

  function meshCellsCellAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (storedConfigs && name in storedConfigs) {
      return storedConfigs[name].lastItem;
    }
    return 0;
  }

  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    setMeshCellsCellAttributeStoredConfig(id, name, item, { minimum, maximum });
    return applyCellAttribute(id);
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    return storedConfig.colorMap;
  }

  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    setMeshCellsCellAttributeStoredConfig(id, name, item, { colorMap });
    return applyCellAttribute(id);
  }

  function setMeshCellsCellAttribute(id, { name, item, minimum, maximum, colorMap }) {
    mutateMeshCellsCellStyle(id, { name, item });
    setMeshCellsCellAttributeStoredConfig(id, name, item, { minimum, maximum, colorMap });
    const points = getRGBPointsFromPreset(colorMap);
    const schema = meshCellsCellAttributeSchemas.attribute;
    const params = { id, name, item, points, minimum, maximum };
    return viewerStore.request({ schema, params });
  }

  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    meshCellsCellAttributeLastItem,
    setMeshCellsCellAttribute,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeItem,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
  };
}

export { isMeshCellsCellAttributeValid, useMeshCellsCellAttributeStyle };
