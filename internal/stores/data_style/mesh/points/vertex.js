// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

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

  return {
    meshPointsVertexAttribute,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeStoredConfig,
    mutateMeshPointsVertexStyle,
    meshPointsVertexAttributeName,
  };
}

function useMeshPointsVertexAttributeActions() {
  const viewerStore = useViewerStore();
  const config = useMeshPointsVertexAttributeConfig();

  function setMeshPointsVertexAttributeName(id, name) {
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name };
          const vertex = config.meshPointsVertexAttribute(id);
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          return config.mutateMeshPointsVertexStyle(id, updates);
        },
      },
    );
  }

  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = config.meshPointsVertexAttributeName(id);
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
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () =>
          config.setMeshPointsVertexAttributeStoredConfig(id, name, { colorMap }),
      },
    );
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

  function meshPointsVertexAttributeRange(id) {
    const name = config.meshPointsVertexAttributeName(id);
    const storedConfig = config.meshPointsVertexAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = config.meshPointsVertexAttributeName(id);
    const storedConfig = config.meshPointsVertexAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  return {
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    ...config,
    ...actions,
  };
}
