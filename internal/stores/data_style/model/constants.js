import { getDefaultStyle } from "@ogw_front/utils/default_styles";

const MESH_TYPES = ["Corner", "Line", "Surface", "Block"];

const brepDefaults = getDefaultStyle("BRep");
const DEFAULT_MODEL_COMPONENT_TYPE_COLORS = {
  Corner: brepDefaults.corners.color,
  Line: brepDefaults.lines.color,
  Surface: brepDefaults.surfaces.color,
  Block: brepDefaults.blocks.color,
};

export { MESH_TYPES, DEFAULT_MODEL_COMPONENT_TYPE_COLORS };
