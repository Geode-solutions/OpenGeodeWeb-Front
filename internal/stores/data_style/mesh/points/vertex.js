// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshPointsVertexAttributeConfig() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex;
  }

  function mutateMeshPointsVertexStyle(id, values) {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPointsVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshPointsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function meshPointsVertexAttributeName(id) {
    return meshPointsVertexAttribute(id).name;
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  return {
    meshPointsVertexAttribute,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeStoredConfig,
    mutateMeshPointsVertexStyle,
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPointsVertexAttributeActions() {
  const viewerStore = useViewerStore();
  const config = useMeshPointsVertexAttributeConfig();

  function setMeshPointsVertexAttributeName(id, name) {
    const schema = meshPointsVertexAttributeSchemas.name;
    const params = { id, name };
    return viewerStore.request(
      { schema, params },
      {
        response_function: (response) => {
          config.mutateMeshPointsVertexStyle(id, { name });
          config.setMeshPointsVertexAttributeStoredConfig(id, name, {
            minimum: response.minimum,
            maximum: response.maximum,
          });
          setMeshPointsVertexAttributeColorMap(id, "batlow");
        },
      },
    );
  }

  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = config.meshPointsVertexAttributeName(id);
    const points = getRGBPointsFromPreset(config.meshPointsVertexAttributeColorMap(id));
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            config.setMeshPointsVertexAttributeStoredConfig(id, name, { minimum, maximum }),
        },
      );
    }
    return config.setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    });
  }

  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = config.meshPointsVertexAttributeName(id);
    const storedConfig = config.meshPointsVertexAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPointsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            config.setMeshPointsVertexAttributeStoredConfig(id, name, { colorMap }),
        },
      );
    }
    return config.setMeshPointsVertexAttributeStoredConfig(id, name, { colorMap });
  }

  return {
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  };
}

export function useMeshPointsVertexAttributeStyle() {
  const config = useMeshPointsVertexAttributeConfig();
  const actions = useMeshPointsVertexAttributeActions();

  return {
    ...config,
    ...actions,
  };
}
