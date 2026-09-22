import {
  type AttributeConfig,
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
  type RGBAColor,
} from "./constants";

function emptyAttributeConfig(): AttributeConfig {
  return { name: undefined, storedConfigs: {} };
}

interface MeshComponentColoring {
  active: string;
  constant: RGBAColor;
  vertex: AttributeConfig;
}

interface MeshEdgesColoring extends MeshComponentColoring {
  edge: AttributeConfig;
}

interface MeshCellsColoring extends MeshComponentColoring {
  cell: AttributeConfig;
  // oxlint-disable-next-line unicorn/no-null
  textures: null;
}

interface MeshPolygonsColoring extends MeshComponentColoring {
  // oxlint-disable-next-line unicorn/no-null
  textures: null;
  polygon: AttributeConfig;
}

interface MeshPolyhedraColoring extends MeshComponentColoring {
  polyhedron: AttributeConfig;
}

interface MeshPointsStyle {
  visibility: boolean;
  coloring: MeshComponentColoring;
  size: number;
}

interface MeshEdgesStyle {
  visibility: boolean;
  coloring: MeshEdgesColoring;
  width: number;
}

interface MeshCellsStyle {
  visibility: boolean;
  coloring: MeshCellsColoring;
}

interface MeshPolygonsStyle {
  visibility: boolean;
  coloring: MeshPolygonsColoring;
}

interface MeshPolyhedraStyle {
  visibility: boolean;
  coloring: MeshPolyhedraColoring;
}

interface PointSetStyle {
  visibility: boolean;
  points: MeshPointsStyle;
}

interface EdgedCurveStyle {
  visibility: boolean;
  points: MeshPointsStyle;
  edges: MeshEdgesStyle;
}

interface Grid2dStyle {
  visibility: boolean;
  points: MeshPointsStyle;
  edges: MeshEdgesStyle;
  cells: MeshCellsStyle;
}

interface Grid3dStyle {
  visibility: boolean;
  points: MeshPointsStyle;
  edges: MeshEdgesStyle;
  cells: MeshCellsStyle;
  polyhedra: MeshPolyhedraStyle;
}

interface SurfaceStyle {
  visibility: boolean;
  points: MeshPointsStyle;
  edges: MeshEdgesStyle;
  polygons: MeshPolygonsStyle;
}

interface SolidStyle {
  visibility: boolean;
  points: MeshPointsStyle;
  edges: MeshEdgesStyle;
  polygons: MeshPolygonsStyle;
  polyhedra: MeshPolyhedraStyle;
}

function meshPointsDefaultStyle(
  visibility: boolean = POINTS_DEFAULT_VISIBILITY,
  size: number = POINTS_DEFAULT_SIZE,
  constant: Readonly<RGBAColor> = POINTS_DEFAULT_COLOR,
): MeshPointsStyle {
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
  constant: Readonly<RGBAColor> = EDGES_DEFAULT_COLOR,
): MeshEdgesStyle {
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
  constant: Readonly<RGBAColor> = CELLS_DEFAULT_COLOR,
): MeshCellsStyle {
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
  constant: Readonly<RGBAColor> = POLYGONS_DEFAULT_COLOR,
): MeshPolygonsStyle {
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
  constant: Readonly<RGBAColor> = POLYHEDRA_DEFAULT_COLOR,
): MeshPolyhedraStyle {
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

function pointSetDefaultStyle(): PointSetStyle {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
  };
}

function edgedCurveDefaultStyle(): EdgedCurveStyle {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
    edges: meshEdgesDefaultStyle(),
  };
}

function grid2dDefaultStyle(): Grid2dStyle {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
  };
}

function grid3dDefaultStyle(): Grid3dStyle {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
  };
}

function surfaceDefaultStyle(): SurfaceStyle {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
  };
}

function solidDefaultStyle(): SolidStyle {
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
