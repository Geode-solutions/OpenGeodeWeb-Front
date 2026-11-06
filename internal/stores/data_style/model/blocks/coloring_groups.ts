import type { BlockId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: RGBAColor | undefined;
  blocks_ids: BlockId[];
}

interface AttributeGroup extends ValidAttributeInput {
  blocks_ids: BlockId[];
}

export type { AttributeGroup, ColorGroup };
