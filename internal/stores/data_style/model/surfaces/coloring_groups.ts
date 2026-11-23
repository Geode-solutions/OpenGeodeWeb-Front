import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { SurfaceId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  surfaces_ids: SurfaceId[];
}

interface AttributeGroup extends ValidAttributeInput {
  surfaces_ids: SurfaceId[];
}

export type { AttributeGroup, ColorGroup };
