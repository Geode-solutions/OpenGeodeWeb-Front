// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshCellsCellAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell;

// oxlint-disable-next-line max-lines-per-function
export function useMeshCellsCellAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsCellAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).cell;
  }

  function meshCellsCellAttributeStoredConfig(id, name, item) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (name in storedConfigs && item in storedConfigs[name]) {
      return storedConfigs[name][item];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setMeshCellsCellAttributeStoredConfig(id, name, item, defaultConfig);
    return defaultConfig;
  }

  function setMeshCellsCellAttributeStoredConfig(id, name, item, config) {
    return meshCellsCommonStyle.mutateMeshCellsCellStyle(id, {
      storedConfigs: {
        [name]: {
          lastItem: item,
          [item]: config,
        },
      },
    });
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsCellAttribute(id).name;
  }

  function meshCellsCellAttributeItem(id) {
    const cellAttribute = meshCellsCellAttribute(id);
    return cellAttribute.item ?? meshCellsCellAttributeLastItem(id, cellAttribute.name);
  }

  function meshCellsCellAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (!(name in storedConfigs)) {
      return 0;
    }
    return storedConfigs[name].lastItem;
  }

  function setMeshCellsCellAttributeName(id, name) {
    const item = meshCellsCellAttributeLastItem(id, name);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const schema = meshCellsCellAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          meshCellsCommonStyle.mutateMeshCellsCellStyle(id, { name, item });
          return setMeshCellsCellAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshCellsCellAttributeItem(id, item) {
    const name = meshCellsCellAttributeName(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const schema = meshCellsCellAttributeSchemas.name;
    const params = { id, name, item };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          meshCellsCommonStyle.mutateMeshCellsCellStyle(id, { item });
          return setMeshCellsCellAttributeStoredConfig(id, name, item, storedConfig);
        },
      },
    );
  }

  function setMeshCellsCellAttribute(id, name, item) {
    const currentName = meshCellsCellAttributeName(id);
    if (name !== currentName) {
      return setMeshCellsCellAttributeName(id, name);
    }
    const currentItem = meshCellsCellAttributeItem(id);
    if (item !== currentItem) {
      return setMeshCellsCellAttributeItem(id, item);
    }
  }

  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const colorMap = meshCellsCellAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    function storeConfig() {
      return setMeshCellsCellAttributeStoredConfig(id, name, item, { minimum, maximum });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsCellAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    function storeConfig() {
      return setMeshCellsCellAttributeStoredConfig(id, name, item, { colorMap });
    }
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsCellAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        {
          schema,
          params,
        },
        {
          response_function: storeConfig,
        },
      );
    }
    return storeConfig();
  }

  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeItem,
    setMeshCellsCellAttribute,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
  };
}
