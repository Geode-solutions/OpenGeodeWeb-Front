// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
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
    const schema = meshPolygonsVertexAttributeSchemas.name;
    const params = { id, name };
    return viewerStore.request(
      { schema, params },
      {
        response_function: (response) => {
          mutateMeshPolygonsVertexStyle(id, { name });
          setMeshPolygonsVertexAttributeStoredConfig(id, name, {
            minimum: response.minimum,
            maximum: response.maximum,
          });
          setMeshPolygonsVertexAttributeColorMap(id, "batlow");
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
    const points = getRGBPointsFromPreset(meshPolygonsVertexAttributeColorMap(id));
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      const schema = meshPolygonsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
        {
          response_function: () =>
            setMeshPolygonsVertexAttributeStoredConfig(id, name, { minimum, maximum }),
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
      const schema = meshPolygonsVertexAttributeSchemas.color_map;
      const params = { id, points, minimum, maximum };
      return viewerStore.request(
        { schema, params },
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
