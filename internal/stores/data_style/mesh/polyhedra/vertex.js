// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

function useMeshPolyhedraVertexAttributeConfig() {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).vertex;
  }

  function mutateMeshPolyhedraVertexStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function meshPolyhedraVertexAttributeName(id) {
    return meshPolyhedraVertexAttribute(id).name;
  }

  return {
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttributeStoredConfig,
    mutateMeshPolyhedraVertexStyle,
    meshPolyhedraVertexAttributeName,
  };
}

function useMeshPolyhedraVertexAttributeActions() {
  const viewerStore = useViewerStore();
  const config = useMeshPolyhedraVertexAttributeConfig();

  function setMeshPolyhedraVertexAttributeName(id, name) {
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name };
          const vertex = config.meshPolyhedraVertexAttribute(id);
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          return config.mutateMeshPolyhedraVertexStyle(id, updates);
        },
      },
    );
  }

  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = config.meshPolyhedraVertexAttributeName(id);
    const points = getRGBPointsFromPreset(config.meshPolyhedraVertexAttributeColorMap(id));
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(meshPolyhedraVertexAttributeSchemas.color_map, { id, points, minimum, maximum }, {
        response_function: () => config.setMeshPolyhedraVertexAttributeStoredConfig(id, name, { minimum, maximum }),
      });
    }
    return config.setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    });
  }

  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const name = config.meshPolyhedraVertexAttributeName(id);
    const storedConfig = config.meshPolyhedraVertexAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(meshPolyhedraVertexAttributeSchemas.color_map, { id, points, minimum, maximum }, {
        response_function: () => config.setMeshPolyhedraVertexAttributeStoredConfig(id, name, { colorMap }),
      });
    }
    return config.setMeshPolyhedraVertexAttributeStoredConfig(id, name, { colorMap });
  }

  return {
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
  };
}

export function useMeshPolyhedraVertexAttributeStyle() {
  const config = useMeshPolyhedraVertexAttributeConfig();
  const actions = useMeshPolyhedraVertexAttributeActions();

  function meshPolyhedraVertexAttributeRange(id) {
    const name = config.meshPolyhedraVertexAttributeName(id);
    const storedConfig = config.meshPolyhedraVertexAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = config.meshPolyhedraVertexAttributeName(id);
    const storedConfig = config.meshPolyhedraVertexAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  return {
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    ...config,
    ...actions,
  };
}
