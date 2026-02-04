// Global variables
const points_defaultVisibility = true
const edges_defaultVisibility = true
const cells_defaultVisibility = true
const polygons_defaultVisibility = true
const polyhedra_defaultVisibility = true
const points_defaultSize = 10
const points_defaultColor = { r: 20, g: 20, b: 20 }
const edges_defaultWidth = 2
const edges_defaultColor = { r: 20, g: 20, b: 20 }
const cells_defaultColor = { r: 255, g: 255, b: 255 }
const polygons_defaultColor = { r: 255, g: 255, b: 255 }
const polyhedra_defaultColor = { r: 255, g: 255, b: 255 }

const corners_defaultVisibility = true
const corners_defaultColor = { r: 20, g: 20, b: 20 }
const lines_defaultVisibility = true
const lines_defaultColor = { r: 20, g: 20, b: 20 }
const surfaces_defaultVisibility = true
const surfaces_defaultColor = { r: 255, g: 255, b: 255 }
const blocks_defaultVisibility = true
const blocks_defaultColor = { r: 255, g: 255, b: 255 }

// Mesh functions
const meshPointsDefaultStyle = (
  visibility = points_defaultVisibility,
  size = points_defaultSize,
  color = points_defaultColor,
) => {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      vertex: null,
    },
    size,
    attributes: {},
  }
}

const meshEdgesDefaultStyle = (
  visibility = edges_defaultVisibility,
  width = edges_defaultWidth,
  color = edges_defaultColor,
) => {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      edge: null,
      vertex: null,
    },
    width,
    attributes: {},
  }
}

const meshCellsDefaultStyle = (
  visibility = cells_defaultVisibility,
  color = cells_defaultColor,
) => {
  return {
    visibility,
    coloring: {
      active: "color",
      cell: null,
      color,
      textures: null,
      vertex: null,
    },
    attributes: {},
  }
}

const meshPolygonsDefaultStyle = (
  visibility = polygons_defaultVisibility,
  color = polygons_defaultColor,
) => {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      textures: null,
      polygon: null,
      vertex: null,
    },
    attributes: {},
  }
}

const meshPolyhedraDefaultStyle = (
  visibility = polyhedra_defaultVisibility,
  color = polyhedra_defaultColor,
) => {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      polyhedron: null,
      vertex: null,
    },
    attributes: {},
  }
}

const pointSet_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
    attributes: {},
  }
}

const edgedCurve_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(),
    edges: meshEdgesDefaultStyle(),
    attributes: {},
  }
}

const grid2d_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
    attributes: {},
  }
}

const grid3d_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    cells: meshCellsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
    attributes: {},
  }
}
const surface_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
    attributes: {},
  }
}

const solid_defaultStyle = () => {
  return {
    visibility: true,
    points: meshPointsDefaultStyle(false),
    edges: meshEdgesDefaultStyle(false),
    polygons: meshPolygonsDefaultStyle(),
    polyhedra: meshPolyhedraDefaultStyle(),
    attributes: {},
  }
}

// Model functions
const modelCornersDefaultStyle = (
  visibility = corners_defaultVisibility,
  color = corners_defaultColor,
) => {
  return { visibility, color, attributes: {} }
}
const modelLinesDefaultStyle = (
  visibility = lines_defaultVisibility,
  color = lines_defaultColor,
) => {
  return { visibility, color, attributes: {} }
}
const modelSurfacesDefaultStyle = (
  visibility = surfaces_defaultVisibility,
  color = surfaces_defaultColor,
) => {
  return { visibility, color, attributes: {} }
}
const modelBlocksDefaultStyle = (
  visibility = blocks_defaultVisibility,
  color = blocks_defaultColor,
) => {
  return { visibility, color, attributes: {} }
}
const modelPointsDefaultStyle = (
  visibility = points_defaultVisibility,
  size,
) => {
  return { visibility, size, attributes: {} }
}
const modelEdgesDefaultStyle = (visibility = edges_defaultVisibility) => {
  return { visibility, attributes: {} }
}

const brep_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const crossSection_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const structuralModel_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const section_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const implicitCrossSection_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const implicitStructuralModel_defaultStyle = () => {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
    attributes: {},
  }
}

const default_styles = () => {
  return {
    BRep: brep_defaultStyle(),
    CrossSection: crossSection_defaultStyle(),
    EdgedCurve2D: edgedCurve_defaultStyle(),
    EdgedCurve3D: edgedCurve_defaultStyle(),
    Graph: {},
    HybridSolid3D: solid_defaultStyle(),
    ImplicitCrossSection: implicitCrossSection_defaultStyle(),
    ImplicitStructuralModel: implicitStructuralModel_defaultStyle(),
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
    Section: section_defaultStyle(),
    StructuralModel: structuralModel_defaultStyle(),
    TetrahedralSolid3D: solid_defaultStyle(),
    TriangulatedSurface2D: surface_defaultStyle(),
    TriangulatedSurface3D: surface_defaultStyle(),
    VertexSet: {},
  }
}

function getDefaultStyle(type) {
  return default_styles()[type]
}

export { getDefaultStyle }
