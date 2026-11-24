import type { BlockId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  blocks_ids: BlockId[];
}

interface AttributeGroup extends ValidAttributeInput {
  blocks_ids: BlockId[];
}

export type { AttributeGroup, ColorGroup };
