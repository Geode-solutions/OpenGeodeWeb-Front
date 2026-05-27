// Global variables (shared settings defined locally for model components)
const points_defaultVisibility = true;
const points_defaultSize = 10;
const edges_defaultVisibility = true;
const edges_defaultWidth = 2;

const corners_defaultVisibility = true;
const corners_defaultColor = { red: 20, green: 20, blue: 20, alpha: 1 };
const lines_defaultVisibility = true;
const lines_defaultColor = { red: 20, green: 20, blue: 20, alpha: 1 };
const surfaces_defaultVisibility = true;
const surfaces_defaultColor = { red: 255, green: 255, blue: 255, alpha: 1 };
const blocks_defaultVisibility = true;
const blocks_defaultColor = { red: 255, green: 255, blue: 255, alpha: 1 };

const DEFAULT_MODEL_COMPONENT_TYPE_COLORS = {
  Corner: corners_defaultColor,
  Line: lines_defaultColor,
  Surface: surfaces_defaultColor,
  Block: blocks_defaultColor,
};

const MESH_TYPES = ["Corner", "Line", "Surface", "Block"];

// Model functions
function modelCornersDefaultStyle(
  visibility = corners_defaultVisibility,
  color = corners_defaultColor,
) {
  return {
    visibility,
    color,
    color_mode: "constant",
    vertex_attribute: {
      name: undefined,
      storedConfigs: {},
    },
  };
}

function modelLinesDefaultStyle(visibility = lines_defaultVisibility, color = lines_defaultColor) {
  return {
    visibility,
    color,
    color_mode: "constant",
    vertex_attribute: {
      name: undefined,
      storedConfigs: {},
    },
    edge_attribute: {
      name: undefined,
      storedConfigs: {},
    },
  };
}

function modelSurfacesDefaultStyle(
  visibility = surfaces_defaultVisibility,
  color = surfaces_defaultColor,
) {
  return {
    visibility,
    color,
    color_mode: "constant",
    vertex_attribute: {
      name: undefined,
      storedConfigs: {},
    },
    polygon_attribute: {
      name: undefined,
      storedConfigs: {},
    },
  };
}

function modelBlocksDefaultStyle(
  visibility = blocks_defaultVisibility,
  color = blocks_defaultColor,
) {
  return {
    visibility,
    color,
    color_mode: "constant",
    vertex_attribute: {
      name: undefined,
      storedConfigs: {},
    },
    polyhedron_attribute: {
      name: undefined,
      storedConfigs: {},
    },
  };
}

function modelPointsDefaultStyle(visibility = points_defaultVisibility, size = points_defaultSize) {
  return { visibility, size };
}

function modelEdgesDefaultStyle(visibility = edges_defaultVisibility, width = edges_defaultWidth) {
  return { visibility, width };
}

const DEFAULT_MODEL_COMPONENT_TYPE_STYLES = {
  Corner: modelCornersDefaultStyle(),
  Line: modelLinesDefaultStyle(),
  Surface: modelSurfacesDefaultStyle(),
  Block: modelBlocksDefaultStyle(),
};

function brep_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

function crossSection_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

function structuralModel_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

function section_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

function implicitCrossSection_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

function implicitStructuralModel_defaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, points_defaultSize),
    edges: modelEdgesDefaultStyle(false, edges_defaultWidth),
  };
}

export {
  DEFAULT_MODEL_COMPONENT_TYPE_COLORS,
  DEFAULT_MODEL_COMPONENT_TYPE_STYLES,
  MESH_TYPES,
  brep_defaultStyle,
  crossSection_defaultStyle,
  structuralModel_defaultStyle,
  section_defaultStyle,
  implicitCrossSection_defaultStyle,
  implicitStructuralModel_defaultStyle,
};
