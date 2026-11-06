import type { LineId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: RGBAColor | undefined;
  lines_ids: LineId[];
}

interface AttributeGroup extends ValidAttributeInput {
  lines_ids: LineId[];
}

export type { AttributeGroup, ColorGroup };
