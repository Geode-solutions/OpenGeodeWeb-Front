import {
  CELLS_DEFAULT_COLOR,
  CELLS_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_COLOR,
  EDGES_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_WIDTH,
  MESH_DEFAULT_ACTIVE_COLORING,
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
  constant = POINTS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
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
  constant = EDGES_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
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

function meshCellsDefaultStyle(
  visibility = CELLS_DEFAULT_VISIBILITY,
  constant = CELLS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      cell: {
        name: undefined,
        storedConfigs: {},
      },
      constant,
      textures: null,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function meshPolygonsDefaultStyle(
  visibility = POLYGONS_DEFAULT_VISIBILITY,
  constant = POLYGONS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      textures: null,
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
  constant = POLYHEDRA_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
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

function pointSetDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
  };
}

function edgedCurveDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
    edges: meshEdgesDefaultStyle(),
  };
}

function grid2dDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
  };
}

function grid3dDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
  };
}

function surfaceDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
  };
}

function solidDefaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
  };
}

export {
  meshPointsDefaultStyle,
  meshEdgesDefaultStyle,
  meshCellsDefaultStyle,
  meshPolygonsDefaultStyle,
  meshPolyhedraDefaultStyle,
  pointSetDefaultStyle,
  edgedCurveDefaultStyle,
  grid2dDefaultStyle,
  grid3dDefaultStyle,
  surfaceDefaultStyle,
  solidDefaultStyle,
};
