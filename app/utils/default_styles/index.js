import {
  brepDefaultStyle,
  crossSectionDefaultStyle,
  implicitCrossSectionDefaultStyle,
  implicitStructuralModelDefaultStyle,
  sectionDefaultStyle,
  structuralModelDefaultStyle,
} from "./models";
import {
  meshCellsDefaultStyle,
  meshEdgesDefaultStyle,
  meshPointsDefaultStyle,
  meshPolygonsDefaultStyle,
  meshPolyhedraDefaultStyle,
} from "./meshes";

function default_styles() {
  return {
    BRep: brepDefaultStyle(),
    CrossSection: crossSectionDefaultStyle(),
    EdgedCurve2D: edgedCurve_defaultStyle(),
    EdgedCurve3D: edgedCurve_defaultStyle(),
    Graph: {},
    HybridSolid3D: solid_defaultStyle(),
    ImplicitCrossSection: implicitCrossSectionDefaultStyle(),
    ImplicitStructuralModel: implicitStructuralModelDefaultStyle(),
    LightRegularGrid2D: grid2d_defaultStyle(),
    LightRegularGrid3D: grid3d_defaultStyle(),
    PointSet2D: pointSet_defaultStyle(),
    PointSet3D: pointSet_defaultStyle(),
    PolygonalSurface2D: surface_defaultStyle(),
    PolygonalSurface3D: surface_defaultStyle(),
    PolyhedralSolid3D: solid_defaultStyle(),
    RasterImage2D: {},
    RasterImage3D: {},
    RegularGrid2D: grid2d_defaultStyle(),
    RegularGrid3D: grid3d_defaultStyle(),
    Section: sectionDefaultStyle(),
    StructuralModel: structuralModelDefaultStyle(),
    TetrahedralSolid3D: solid_defaultStyle(),
    TriangulatedSurface2D: surface_defaultStyle(),
    TriangulatedSurface3D: surface_defaultStyle(),
    VertexSet: {},
  };
}

function pointSet_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
  };
}

function edgedCurve_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
    edges: meshEdgesDefaultStyle(),
  };
}

function grid2d_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
  };
}

function grid3d_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
  };
}

function surface_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
  };
}

function solid_defaultStyle() {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
  };
}

function getDefaultStyle(type) {
  return default_styles()[type];
}

export { DEFAULT_MODEL_COMPONENT_TYPE_STYLES } from "./models";
export { MESH_COMPONENT_TYPES, DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "./constants";
export { getDefaultStyle };
