import {
  type ComponentColoring,
  MODEL_DEFAULT_ACTIVE_COLORING,
  MODEL_DEFAULT_COLOR,
} from "./constants";
import {
  type ModelBlocksStyle,
  type ModelCornersStyle,
  type ModelEdgesStyle,
  type ModelLinesStyle,
  type ModelPointsStyle,
  type ModelSurfacesStyle,
  modelBlocksDefaultStyle,
  modelCornersDefaultStyle,
  modelEdgesDefaultStyle,
  modelLinesDefaultStyle,
  modelPointsDefaultStyle,
  modelSurfacesDefaultStyle,
} from "./model_components";
import type { Visibility } from "@ogw_front/types/style";

interface ModelWithoutBlocksStyle {
  visibility: Visibility;
  coloring: Pick<ComponentColoring, "active" | "constant">;
  corners: ModelCornersStyle;
  lines: ModelLinesStyle;
  surfaces: ModelSurfacesStyle;
  points: ModelPointsStyle;
  edges: ModelEdgesStyle;
}

interface ModelWithBlocksStyle extends ModelWithoutBlocksStyle {
  blocks: ModelBlocksStyle;
}

function brepDefaultStyle(): ModelWithBlocksStyle {
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

function crossSectionDefaultStyle(): ModelWithoutBlocksStyle {
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

function structuralModelDefaultStyle(): ModelWithBlocksStyle {
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

function sectionDefaultStyle(): ModelWithoutBlocksStyle {
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

function implicitCrossSectionDefaultStyle(): ModelWithoutBlocksStyle {
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

function implicitStructuralModelDefaultStyle(): ModelWithBlocksStyle {
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
} from "./model_components";
export {
  brepDefaultStyle,
  crossSectionDefaultStyle,
  structuralModelDefaultStyle,
  sectionDefaultStyle,
  implicitCrossSectionDefaultStyle,
  implicitStructuralModelDefaultStyle,
};
