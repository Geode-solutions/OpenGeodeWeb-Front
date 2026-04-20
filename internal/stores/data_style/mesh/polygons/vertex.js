// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

export function useMeshPolygonsVertexAttributeStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsVertexAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).vertex;
  }

  function meshPolygonsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id);
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    });
  }

  function mutateMeshPolygonsVertexStyle(id, values) {
    return meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: {
        vertex: values,
      },
    });
  }

  function setMeshPolygonsVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshPolygonsVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function meshPolygonsVertexAttributeName(id) {
    return meshPolygonsVertexAttribute(id).name;
  }

  function setMeshPolygonsVertexAttributeName(id, name) {
    return viewerStore.request(
      meshPolygonsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name };
          const vertex = meshPolygonsVertexAttribute(id);
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          return mutateMeshPolygonsVertexStyle(id, updates);
        },
      },
    );
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name);
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id);
    const colorMap = meshPolygonsVertexAttributeColorMap(id);
    const points = getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        meshPolygonsVertexAttributeSchemas.color_map,
        { id, points, minimum, maximum },
        {
          response_function: () =>
            setMeshPolygonsVertexAttributeStoredConfig(id, name, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    });
  }

  function meshPolygonsVertexAttributeColorMap(id) {
    const name = meshPolygonsVertexAttributeName(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name);
    const { colorMap } = storedConfig;
    return colorMap;
  }

  function setMeshPolygonsVertexAttributeColorMap(id, colorMap) {
    const name = meshPolygonsVertexAttributeName(id);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name);
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        meshPolygonsVertexAttributeSchemas.color_map,
        { id, points, minimum, maximum },
        {
          response_function: () =>
            setMeshPolygonsVertexAttributeStoredConfig(id, name, { colorMap }),
        },
      );
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, { colorMap });
  }

  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
  };
}
