// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraPolyhedronAttributeConfig() {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).polyhedron;
  }

  function mutateMeshPolyhedraPolyhedronStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        polyhedron: values,
      },
    });
  }

  function setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, config) {
    return mutateMeshPolyhedraPolyhedronStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshPolyhedraPolyhedronAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraPolyhedronAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function meshPolyhedraPolyhedronAttributeName(id) {
    return meshPolyhedraPolyhedronAttribute(id).name;
  }

  function meshPolyhedraPolyhedronAttributeRange(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  return {
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttributeStoredConfig,
    mutateMeshPolyhedraPolyhedronStyle,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
  };
}

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraPolyhedronAttributeActions() {
  const viewerStore = useViewerStore();
  const config = useMeshPolyhedraPolyhedronAttributeConfig();

  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const schema = meshPolyhedraPolyhedronAttributeSchemas.name;
    const params = { id, name };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => {
          const updates = { name };
          const polyhedron = config.meshPolyhedraPolyhedronAttribute(id);
          if (!(name in polyhedron.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          return config.mutateMeshPolyhedraPolyhedronStyle(id, updates);
        },
      },
    );
  }

  function setMeshPolyhedraPolyhedronAttributeRange(id, minimum, maximum) {
    const name = config.meshPolyhedraPolyhedronAttributeName(id);
    const points = getRGBPointsFromPreset(config.meshPolyhedraPolyhedronAttributeColorMap(id));
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            config.setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, { minimum, maximum }),
        },
      );
    }
    return config.setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    });
  }

  function setMeshPolyhedraPolyhedronAttributeColorMap(id, colorMap) {
    const name = config.meshPolyhedraPolyhedronAttributeName(id);
    const storedConfig = config.meshPolyhedraPolyhedronAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolyhedraPolyhedronAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            config.setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, { colorMap }),
        },
      );
    }
    return config.setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, { colorMap });
  }

  return {
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
  };
}

export function useMeshPolyhedraPolyhedronAttributeStyle() {
  const config = useMeshPolyhedraPolyhedronAttributeConfig();
  const actions = useMeshPolyhedraPolyhedronAttributeActions();

  return {
    ...config,
    ...actions,
  };
}
