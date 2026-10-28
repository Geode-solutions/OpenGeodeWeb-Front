import {
  SCENE_DEFAULT_BACKGROUND_COLOR,
  SCENE_DEFAULT_FONT_FAMILY,
  SCENE_DEFAULT_ORIENTATION_WIDGET,
  SCENE_DEFAULT_TEXT_COLOR,
} from "./constants";
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
import type { SceneStyle } from "@ogw_internal/stores/data_style/types";

function default_styles(): Record<string, unknown> {
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

function getDefaultStyle(type: string): unknown {
  const styles: Record<string, unknown> = default_styles();
  return styles[type];
}

function getDefaultSceneStyle(): SceneStyle {
  return {
    id: "scene",
    background_color: { ...SCENE_DEFAULT_BACKGROUND_COLOR },
    text: { color: { ...SCENE_DEFAULT_TEXT_COLOR }, font_family: SCENE_DEFAULT_FONT_FAMILY },
    orientation_widget: SCENE_DEFAULT_ORIENTATION_WIDGET,
  };
}

export { DEFAULT_MODEL_COMPONENT_TYPE_STYLES } from "./models";
export {
  MESH_COMPONENT_TYPES,
  DEFAULT_MODEL_COMPONENT_TYPE_COLORS,
  MODEL_DEFAULT_COLOR,
  MODEL_DEFAULT_ACTIVE_COLORING,
  DEFAULT_NO_DATA_COLOR,
} from "./constants";
export { getDefaultSceneStyle, getDefaultStyle };
