import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { LineId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  lines_ids: LineId[];
}

interface AttributeGroup extends ValidAttributeInput {
  lines_ids: LineId[];
}

export type { AttributeGroup, ColorGroup };
