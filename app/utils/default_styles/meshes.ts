import {
  type MeshCellsStyle,
  type MeshEdgesStyle,
  type MeshPointsStyle,
  type MeshPolygonsStyle,
  type MeshPolyhedraStyle,
  meshCellsDefaultStyle,
  meshEdgesDefaultStyle,
  meshPointsDefaultStyle,
  meshPolygonsDefaultStyle,
  meshPolyhedraDefaultStyle,
} from "./mesh_components";

interface PointSetStyle {
  visibility: boolean;
  points: MeshPointsStyle;
}

interface EdgedCurveStyle extends PointSetStyle {
  edges: MeshEdgesStyle;
}

interface Grid2dStyle extends EdgedCurveStyle {
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
} from "./mesh_components";
export {
  pointSetDefaultStyle,
  edgedCurveDefaultStyle,
  grid2dDefaultStyle,
  grid3dDefaultStyle,
  surfaceDefaultStyle,
  solidDefaultStyle,
};
