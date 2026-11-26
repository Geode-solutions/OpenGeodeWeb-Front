import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { SurfaceId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";

interface ColorGroup {
  color: ColorRGBA | undefined;
  surfaceIds: SurfaceId[];
}

interface AttributeGroup extends ValidAttributeInput {
  surfaceIds: NonEmptyArray<SurfaceId>;
}

export type { AttributeGroup, ColorGroup };
