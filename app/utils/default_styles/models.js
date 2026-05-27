import {
  BLOCKS_DEFAULTCOLOR,
  BLOCKS_DEFAULTVISIBILITY,
  CORNERS_DEFAULTCOLOR,
  CORNERS_DEFAULTVISIBILITY,
  EDGES_DEFAULTVISIBILITY,
  EDGES_DEFAULTWIDTH,
  LINES_DEFAULTCOLOR,
  LINES_DEFAULTVISIBILITY,
  POINTS_DEFAULTSIZE,
  POINTS_DEFAULTVISIBILITY,
  SURFACES_DEFAULTCOLOR,
  SURFACES_DEFAULTVISIBILITY,
} from "./constants";

function modelCornersDefaultStyle(
  visibility = CORNERS_DEFAULTVISIBILITY,
  color = CORNERS_DEFAULTCOLOR,
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

function modelLinesDefaultStyle(visibility = LINES_DEFAULTVISIBILITY, color = LINES_DEFAULTCOLOR) {
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
  visibility = SURFACES_DEFAULTVISIBILITY,
  color = SURFACES_DEFAULTCOLOR,
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
  visibility = BLOCKS_DEFAULTVISIBILITY,
  color = BLOCKS_DEFAULTCOLOR,
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

function modelPointsDefaultStyle(visibility = POINTS_DEFAULTVISIBILITY, size = POINTS_DEFAULTSIZE) {
  return { visibility, size };
}

function modelEdgesDefaultStyle(visibility = EDGES_DEFAULTVISIBILITY, width = EDGES_DEFAULTWIDTH) {
  return { visibility, width };
}

const DEFAULT_MODEL_COMPONENT_TYPE_STYLES = {
  Corner: modelCornersDefaultStyle(),
  Line: modelLinesDefaultStyle(),
  Surface: modelSurfacesDefaultStyle(),
  Block: modelBlocksDefaultStyle(),
};

function brepDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

function crossSectionDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

function structuralModelDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

function sectionDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

function implicitCrossSectionDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

function implicitStructuralModelDefaultStyle() {
  return {
    visibility: true,
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false, POINTS_DEFAULTSIZE),
    edges: modelEdgesDefaultStyle(false, EDGES_DEFAULTWIDTH),
  };
}

export {
  modelCornersDefaultStyle,
  modelLinesDefaultStyle,
  modelSurfacesDefaultStyle,
  modelBlocksDefaultStyle,
  modelPointsDefaultStyle,
  modelEdgesDefaultStyle,
  DEFAULT_MODEL_COMPONENT_TYPE_STYLES,
  brepDefaultStyle,
  crossSectionDefaultStyle,
  structuralModelDefaultStyle,
  sectionDefaultStyle,
  implicitCrossSectionDefaultStyle,
  implicitStructuralModelDefaultStyle,
};
