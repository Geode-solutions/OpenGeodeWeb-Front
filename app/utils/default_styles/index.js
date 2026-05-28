import {
  brepDefaultStyle,
  crossSectionDefaultStyle,
  implicitCrossSectionDefaultStyle,
  implicitStructuralModelDefaultStyle,
  sectionDefaultStyle,
  structuralModelDefaultStyle,
} from "./models";
import {
  edgedCurveDefaultStyle,
  grid2dDefaultStyle,
  grid3dDefaultStyle,
  pointSetDefaultStyle,
  solidDefaultStyle,
  surfaceDefaultStyle,
} from "./meshes";

function default_styles() {
  return {
    BRep: brepDefaultStyle(),
    CrossSection: crossSectionDefaultStyle(),
    EdgedCurve2D: edgedCurveDefaultStyle(),
    EdgedCurve3D: edgedCurveDefaultStyle(),
    Graph: {},
    HybridSolid3D: solidDefaultStyle(),
    ImplicitCrossSection: implicitCrossSectionDefaultStyle(),
    ImplicitStructuralModel: implicitStructuralModelDefaultStyle(),
    LightRegularGrid2D: grid2dDefaultStyle(),
    LightRegularGrid3D: grid3dDefaultStyle(),
    PointSet2D: pointSetDefaultStyle(),
    PointSet3D: pointSetDefaultStyle(),
    PolygonalSurface2D: surfaceDefaultStyle(),
    PolygonalSurface3D: surfaceDefaultStyle(),
    PolyhedralSolid3D: solidDefaultStyle(),
    RasterImage2D: {},
    RasterImage3D: {},
    RegularGrid2D: grid2dDefaultStyle(),
    RegularGrid3D: grid3dDefaultStyle(),
    Section: sectionDefaultStyle(),
    StructuralModel: structuralModelDefaultStyle(),
    TetrahedralSolid3D: solidDefaultStyle(),
    TriangulatedSurface2D: surfaceDefaultStyle(),
    TriangulatedSurface3D: surfaceDefaultStyle(),
    VertexSet: {},
  };
}

function getDefaultStyle(type) {
  return default_styles()[type];
}

export { DEFAULT_MODEL_COMPONENT_TYPE_STYLES } from "./models";
export { MESH_COMPONENT_TYPES, DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "./constants";
export { getDefaultStyle };
