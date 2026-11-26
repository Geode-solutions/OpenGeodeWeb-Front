import type { BlockId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  blockIds: BlockId[];
}

interface AttributeGroup extends ValidAttributeInput {
  blockIds: NonEmptyArray<BlockId>;
}

export type { AttributeGroup, ColorGroup };
