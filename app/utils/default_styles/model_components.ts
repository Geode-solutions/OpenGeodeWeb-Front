import {
  type AttributeConfig,
  BLOCKS_DEFAULT_ACTIVE_COLORING,
  BLOCKS_DEFAULT_COLOR,
  BLOCKS_DEFAULT_VISIBILITY,
  CORNERS_DEFAULT_ACTIVE_COLORING,
  CORNERS_DEFAULT_COLOR,
  CORNERS_DEFAULT_VISIBILITY,
  type ComponentColoring,
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
import type { Size, Visibility, Width } from "@ogw_front/types/style";

function emptyAttributeConfig(): AttributeConfig {
  return { name: undefined, storedConfigs: {} };
}

interface ModelLinesColoring extends ComponentColoring {
  edge: AttributeConfig;
}

interface ModelSurfacesColoring extends ComponentColoring {
  polygon: AttributeConfig;
}

interface ModelBlocksColoring extends ComponentColoring {
  polyhedron: AttributeConfig;
}

interface ModelCornersStyle {
  visibility: Visibility;
  coloring: ComponentColoring;
}

interface ModelLinesStyle {
  visibility: Visibility;
  coloring: ModelLinesColoring;
}

interface ModelSurfacesStyle {
  visibility: Visibility;
  coloring: ModelSurfacesColoring;
}

interface ModelBlocksStyle {
  visibility: Visibility;
  coloring: ModelBlocksColoring;
}

interface ModelPointsStyle {
  visibility: Visibility;
  size: Size;
}

interface ModelEdgesStyle {
  visibility: Visibility;
  width: Width;
}

function modelCornersDefaultStyle(
  visibility: Visibility = CORNERS_DEFAULT_VISIBILITY,
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
  visibility: Visibility = LINES_DEFAULT_VISIBILITY,
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
  visibility: Visibility = SURFACES_DEFAULT_VISIBILITY,
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
  visibility: Visibility = BLOCKS_DEFAULT_VISIBILITY,
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
  visibility: Visibility = POINTS_DEFAULT_VISIBILITY,
  size: Size = POINTS_DEFAULT_SIZE,
): ModelPointsStyle {
  return { visibility, size };
}

function modelEdgesDefaultStyle(
  visibility: Visibility = EDGES_DEFAULT_VISIBILITY,
  width: Width = EDGES_DEFAULT_WIDTH,
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
