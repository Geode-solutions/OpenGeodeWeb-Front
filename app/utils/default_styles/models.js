import {
  BLOCKS_DEFAULT_ACTIVE_COLORING,
  BLOCKS_DEFAULT_COLOR,
  BLOCKS_DEFAULT_VISIBILITY,
  CORNERS_DEFAULT_ACTIVE_COLORING,
  CORNERS_DEFAULT_COLOR,
  CORNERS_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_WIDTH,
  LINES_DEFAULT_ACTIVE_COLORING,
  LINES_DEFAULT_COLOR,
  LINES_DEFAULT_VISIBILITY,
  MODEL_DEFAULT_ACTIVE_COLORING,
  MODEL_DEFAULT_COLOR,
  POINTS_DEFAULT_SIZE,
  POINTS_DEFAULT_VISIBILITY,
  SURFACES_DEFAULT_ACTIVE_COLORING,
  SURFACES_DEFAULT_COLOR,
  SURFACES_DEFAULT_VISIBILITY,
} from "./constants";

function modelCornersDefaultStyle(
  visibility = CORNERS_DEFAULT_VISIBILITY,
  constant = CORNERS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: CORNERS_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function modelLinesDefaultStyle(
  visibility = LINES_DEFAULT_VISIBILITY,
  constant = LINES_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: LINES_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
      edge: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function modelSurfacesDefaultStyle(
  visibility = SURFACES_DEFAULT_VISIBILITY,
  constant = SURFACES_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: SURFACES_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
      polygon: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function modelBlocksDefaultStyle(
  visibility = BLOCKS_DEFAULT_VISIBILITY,
  constant = BLOCKS_DEFAULT_COLOR,
) {
  return {
    visibility,
    coloring: {
      active: BLOCKS_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
      polyhedron: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function modelPointsDefaultStyle(
  visibility = POINTS_DEFAULT_VISIBILITY,
  size = POINTS_DEFAULT_SIZE,
) {
  return { visibility, size };
}

function modelEdgesDefaultStyle(
  visibility = EDGES_DEFAULT_VISIBILITY,
  width = EDGES_DEFAULT_WIDTH,
) {
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
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
  };
}

function crossSectionDefaultStyle() {
  return {
    visibility: true,
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
  };
}

function structuralModelDefaultStyle() {
  return {
    visibility: true,
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
  };
}

function sectionDefaultStyle() {
  return {
    visibility: true,
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
  };
}

function implicitCrossSectionDefaultStyle() {
  return {
    visibility: true,
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
  };
}

function implicitStructuralModelDefaultStyle() {
  return {
    visibility: true,
    coloring: {
      active: MODEL_DEFAULT_ACTIVE_COLORING,
      constant: MODEL_DEFAULT_COLOR,
    },
    corners: modelCornersDefaultStyle(),
    lines: modelLinesDefaultStyle(),
    surfaces: modelSurfacesDefaultStyle(),
    blocks: modelBlocksDefaultStyle(),
    points: modelPointsDefaultStyle(false),
    edges: modelEdgesDefaultStyle(false),
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
