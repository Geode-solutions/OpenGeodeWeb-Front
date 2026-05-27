import {
  CELLS_DEFAULT_COLOR,
  CELLS_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_COLOR,
  EDGES_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_WIDTH,
  POINTS_DEFAULT_COLOR,
  POINTS_DEFAULT_SIZE,
  POINTS_DEFAULT_VISIBILITY,
  POLYGONS_DEFAULT_COLOR,
  POLYGONS_DEFAULT_VISIBILITY,
  POLYHEDRA_DEFAULT_COLOR,
  POLYHEDRA_DEFAULT_VISIBILITY,
} from "./constants";

function meshPointsDefaultStyle(
  visibility = POINTS_DEFAULT_VISIBILITY,
  size = POINTS_DEFAULT_SIZE,
  color = POINTS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
    size,
  };
}

function meshEdgesDefaultStyle(
  visibility = EDGES_DEFAULT_VISIBILITY,
  width = EDGES_DEFAULT_WIDTH,
  color = EDGES_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      edge: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
    width,
  };
}

function meshCellsDefaultStyle(visibility = CELLS_DEFAULT_VISIBILITY, color = CELLS_DEFAULT_COLOR) {
  return {
    visibility,
    coloring: {
      active: "color",
      cell: {
        name: undefined,
        storedConfigs: {},
      },
      color,
      textures: undefined,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function meshPolygonsDefaultStyle(
  visibility = POLYGONS_DEFAULT_VISIBILITY,
  color = POLYGONS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      textures: undefined,
      polygon: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function meshPolyhedraDefaultStyle(
  visibility = POLYHEDRA_DEFAULT_VISIBILITY,
  color = POLYHEDRA_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      polyhedron: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

export {
  meshPointsDefaultStyle,
  meshEdgesDefaultStyle,
  meshCellsDefaultStyle,
  meshPolygonsDefaultStyle,
  meshPolyhedraDefaultStyle,
};
