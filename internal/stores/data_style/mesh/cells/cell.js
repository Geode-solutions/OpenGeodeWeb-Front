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
      return storedConfigs[name][item];
    }
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

  function meshCellsCellAttributeLastItem(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name].lastItem ?? 0;
    }
    return 0;
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsCellAttribute(id).name;
  }

  function meshCellsCellAttributeValue(id) {
    const attr = meshCellsCellAttribute(id);
    return { name: attr.name, item: attr.item };
  }

  function setMeshCellsCellAttributeName(id, name, item) {
    const currentName = meshCellsCellAttributeName(id);
    const targetItem = currentName === name ? item : meshCellsCellAttributeLastItem(id, name);
    const schema = meshCellsCellAttributeSchemas.name;
    const params = { id, name, item: targetItem };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshCellsCommonStyle.mutateMeshCellsCellStyle(id, {
            name,
            item: targetItem,
            storedConfigs: {
              [name]: {
                lastItem: targetItem,
              },
            },
          }),
      },
    );
  }

  function meshCellsCellAttributeRange(id) {
    const { name, item } = meshCellsCellAttributeValue(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return [undefined, undefined];
    }
    return [storedConfig.minimum, storedConfig.maximum];
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const { name, item } = meshCellsCellAttributeValue(id);
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
    const { name, item } = meshCellsCellAttributeValue(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    if (storedConfig === undefined) {
      return;
    }
    return storedConfig.colorMap;
  }

  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const { name, item } = meshCellsCellAttributeValue(id);
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
    meshCellsCellAttributeValue,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
  };
}
