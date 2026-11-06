import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { SurfaceId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: RGBAColor | undefined;
  surfaces_ids: SurfaceId[];
}

interface AttributeGroup extends ValidAttributeInput {
  surfaces_ids: SurfaceId[];
}

export type { AttributeGroup, ColorGroup };
