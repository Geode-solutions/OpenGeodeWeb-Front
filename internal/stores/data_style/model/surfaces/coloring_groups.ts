import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: RGBAColor | undefined;
  surfaces_ids: ModelComponentId[];
}

interface AttributeGroup extends ValidAttributeInput {
  surfaces_ids: ModelComponentId[];
}

export type { AttributeGroup, ColorGroup };
