import {
  type AttributeConfig,
  type RGBAColor,
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

function emptyAttributeConfig(): AttributeConfig {
  return { name: undefined, storedConfigs: {} };
}

function meshPointsDefaultStyle(
  visibility: boolean = POINTS_DEFAULT_VISIBILITY,
  size: number = POINTS_DEFAULT_SIZE,
  constant: RGBAColor = POINTS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
    },
    size,
  };
}

function meshEdgesDefaultStyle(
  visibility: boolean = EDGES_DEFAULT_VISIBILITY,
  width: number = EDGES_DEFAULT_WIDTH,
  constant: RGBAColor = EDGES_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      edge: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
    },
    width,
  };
}

function meshCellsDefaultStyle(
  visibility: boolean = CELLS_DEFAULT_VISIBILITY,
  constant: RGBAColor = CELLS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      cell: emptyAttributeConfig(),
      constant,
      // oxlint-disable-next-line unicorn/no-null
      textures: null,
      vertex: emptyAttributeConfig(),
    },
  };
}

function meshPolygonsDefaultStyle(
  visibility: boolean = POLYGONS_DEFAULT_VISIBILITY,
  constant: RGBAColor = POLYGONS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      // oxlint-disable-next-line unicorn/no-null
      textures: null,
      polygon: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
    },
  };
}

function meshPolyhedraDefaultStyle(
  visibility: boolean = POLYHEDRA_DEFAULT_VISIBILITY,
  constant: RGBAColor = POLYHEDRA_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      polyhedron: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
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
