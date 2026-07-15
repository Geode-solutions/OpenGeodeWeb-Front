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
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      if (item in nameStoredConfigs) {
        return nameStoredConfigs[item];
      }
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, item, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
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
    return meshCellsCellAttribute(id).item;
  }

  function setMeshCellsCellAttributeName(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    let targetItem = 0;
    let existingConfig = {};
    if (name in storedConfigs) {
      const nameStoredConfigs = storedConfigs[name];
      targetItem = nameStoredConfigs.lastItem ?? 0;
      existingConfig = nameStoredConfigs[targetItem] ?? {};
    }
    const schema = meshCellsCellAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          meshCellsCommonStyle.mutateMeshCellsCellStyle(id, { name, item: targetItem });
          return setMeshCellsCellAttributeStoredConfig(id, name, targetItem, existingConfig);
        },
      },
    );
  }

  function setMeshCellsCellAttributeItem(id, item) {
    const name = meshCellsCellAttributeName(id);
    const { storedConfigs } = meshCellsCellAttribute(id);
    let existingConfig = {};
    if (name in storedConfigs) {
      existingConfig = storedConfigs[name][item] ?? {};
    }
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
          return setMeshCellsCellAttributeStoredConfig(id, name, item, existingConfig);
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
    return Promise.resolve();
  }

  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const colorMap = meshCellsCellAttributeColorMap(id);
    const points = colorMap === undefined ? [] : getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsCellAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshCellsCellAttributeStoredConfig(id, name, item, { minimum, maximum }),
        },
      );
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, item, { minimum, maximum });
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const points = getRGBPointsFromPreset(colorMap);
    const minimum = storedConfig === undefined ? undefined : storedConfig.minimum;
    const maximum = storedConfig === undefined ? undefined : storedConfig.maximum;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsCellAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        {
          schema,
          params,
        },
        {
          response_function: () =>
            setMeshCellsCellAttributeStoredConfig(id, name, item, { colorMap }),
        },
      );
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, item, { colorMap });
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
