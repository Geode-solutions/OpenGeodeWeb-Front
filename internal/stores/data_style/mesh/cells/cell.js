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

  function meshCellsCellAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function setMeshCellsCellAttributeStoredConfig(id, name, config) {
    return meshCellsCommonStyle.mutateMeshCellsCellStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsCellAttribute(id).name;
  }

  function setMeshCellsCellAttributeName(id, name) {
    const schema = meshCellsCellAttributeSchemas.name;
    const params = { id, name };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: (response) => {
          meshCellsCommonStyle.mutateMeshCellsCellStyle(id, { name });
          setMeshCellsCellAttributeStoredConfig(id, name, {
            minimum: response.minimum,
            maximum: response.maximum,
          });
          setMeshCellsCellAttributeColorMap(id, "batlow");
        },
      },
    );
  }

  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id);
    const points = getRGBPointsFromPreset(meshCellsCellAttributeColorMap(id));
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
            setMeshCellsCellAttributeStoredConfig(id, name, { minimum, maximum }),
        },
      );
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, { minimum, maximum });
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshCellsCellAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        {
          schema,
          params,
        },
        {
          response_function: () => setMeshCellsCellAttributeStoredConfig(id, name, { colorMap }),
        },
      );
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, { colorMap });
  }

  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
  };
}
