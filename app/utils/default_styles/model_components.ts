import {
  type AttributeConfig,
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
  POINTS_DEFAULT_SIZE,
  POINTS_DEFAULT_VISIBILITY,
  type RGBAColor,
  SURFACES_DEFAULT_ACTIVE_COLORING,
  SURFACES_DEFAULT_COLOR,
  SURFACES_DEFAULT_VISIBILITY,
} from "./constants";

function emptyAttributeConfig(): AttributeConfig {
  return { name: undefined, storedConfigs: {} };
}

interface ModelComponentColoring {
  active: string;
  constant: RGBAColor;
  vertex: AttributeConfig;
}

interface ModelLinesColoring extends ModelComponentColoring {
  edge: AttributeConfig;
}

interface ModelSurfacesColoring extends ModelComponentColoring {
  polygon: AttributeConfig;
}

interface ModelBlocksColoring extends ModelComponentColoring {
  polyhedron: AttributeConfig;
}

interface ModelCornersStyle {
  visibility: boolean;
  coloring: ModelComponentColoring;
}

interface ModelLinesStyle {
  visibility: boolean;
  coloring: ModelLinesColoring;
}

interface ModelSurfacesStyle {
  visibility: boolean;
  coloring: ModelSurfacesColoring;
}

interface ModelBlocksStyle {
  visibility: boolean;
  coloring: ModelBlocksColoring;
}

interface ModelPointsStyle {
  visibility: boolean;
  size: number;
}

interface ModelEdgesStyle {
  visibility: boolean;
  width: number;
}

function modelCornersDefaultStyle(
  visibility: boolean = CORNERS_DEFAULT_VISIBILITY,
  constant: RGBAColor = CORNERS_DEFAULT_COLOR,
): ModelCornersStyle {
  return {
    visibility,
    coloring: {
      active: CORNERS_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
    },
  };
}

function modelLinesDefaultStyle(
  visibility: boolean = LINES_DEFAULT_VISIBILITY,
  constant: RGBAColor = LINES_DEFAULT_COLOR,
): ModelLinesStyle {
  return {
    visibility,
    coloring: {
      active: LINES_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
      edge: emptyAttributeConfig(),
    },
  };
}

function modelSurfacesDefaultStyle(
  visibility: boolean = SURFACES_DEFAULT_VISIBILITY,
  constant: RGBAColor = SURFACES_DEFAULT_COLOR,
): ModelSurfacesStyle {
  return {
    visibility,
    coloring: {
      active: SURFACES_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
      polygon: emptyAttributeConfig(),
    },
  };
}

function modelBlocksDefaultStyle(
  visibility: boolean = BLOCKS_DEFAULT_VISIBILITY,
  constant: RGBAColor = BLOCKS_DEFAULT_COLOR,
): ModelBlocksStyle {
  return {
    visibility,
    coloring: {
      active: BLOCKS_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
      polyhedron: emptyAttributeConfig(),
    },
  };
}

function modelPointsDefaultStyle(
  visibility: boolean = POINTS_DEFAULT_VISIBILITY,
  size: number = POINTS_DEFAULT_SIZE,
): ModelPointsStyle {
  return { visibility, size };
}

function modelEdgesDefaultStyle(
  visibility: boolean = EDGES_DEFAULT_VISIBILITY,
  width: number = EDGES_DEFAULT_WIDTH,
): ModelEdgesStyle {
  return { visibility, width };
}

const DEFAULT_MODEL_COMPONENT_TYPE_STYLES = {
  Corner: modelCornersDefaultStyle(),
  Line: modelLinesDefaultStyle(),
  Surface: modelSurfacesDefaultStyle(),
  Block: modelBlocksDefaultStyle(),
};

export {
  modelCornersDefaultStyle,
  modelLinesDefaultStyle,
  modelSurfacesDefaultStyle,
  modelBlocksDefaultStyle,
  modelPointsDefaultStyle,
  modelEdgesDefaultStyle,
  DEFAULT_MODEL_COMPONENT_TYPE_STYLES,
};
export type {
  ModelBlocksStyle,
  ModelCornersStyle,
  ModelEdgesStyle,
  ModelLinesStyle,
  ModelPointsStyle,
  ModelSurfacesStyle,
};
