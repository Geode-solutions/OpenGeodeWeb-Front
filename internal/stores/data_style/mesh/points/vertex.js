// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

export function useMeshPointsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex;
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

  function mutateMeshPointsVertexStyle(id, values) {
    return meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: {
        vertex: values,
      },
    })
  }

  function setMeshPointsVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshPointsVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    })
  }

  function meshPointsVertexAttributeName(id) {
    return meshPointsVertexAttribute(id).name
  }

  function setMeshPointsVertexAttributeName(id, name) {
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name }
          const vertex = meshPointsVertexAttribute(id)
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            }
          }
          return mutateMeshPointsVertexStyle(id, updates)
        },
      },
    );
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id)
    return setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    })
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshPointsVertexAttributeStoredConfig(id, name, {
            colorMap,
          })
        },
      },
    );
  }

  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  };
}
