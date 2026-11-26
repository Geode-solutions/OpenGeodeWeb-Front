import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { LineId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  lineIds: LineId[];
}

interface AttributeGroup extends ValidAttributeInput {
  lineIds: NonEmptyArray<LineId>;
}

export type { AttributeGroup, ColorGroup };
