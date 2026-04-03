// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

export function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring;
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesColoring(id).edge;
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshEdgesEdgeAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateMeshEdgesEdgeStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        edge: values,
      },
    });
  }

  function setMeshEdgesEdgeAttributeStoredConfig(id, name, config) {
    return mutateMeshEdgesEdgeStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshEdgesEdgeAttributeName(id) {
    return meshEdgesEdgeAttribute(id).name;
  }

  function setMeshEdgesEdgeAttributeName(id, name) {
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name };
          const edge = meshEdgesEdgeAttribute(id);
          if (!(name in edge.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          return mutateMeshEdgesEdgeStyle(id, updates);
        },
      },
    );
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id);
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    });
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => setMeshEdgesEdgeAttributeStoredConfig(id, name, { colorMap }),
      },
    );
  }

  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  };
}
