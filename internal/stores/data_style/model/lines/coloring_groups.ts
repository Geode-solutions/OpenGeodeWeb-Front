import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: RGBAColor | undefined;
  lines_ids: string[];
}

interface AttributeGroup extends ValidAttributeInput {
  lines_ids: string[];
}

export type { AttributeGroup, ColorGroup };
