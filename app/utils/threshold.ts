import type { AttributeSchemas } from "@ogw_front/utils/attribute_range";
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";

interface AttributeSource {
  title: string;
  schemas: AttributeSchemas;
  timeStepKey: string;
  params: { id: string; component_ids?: string[] };
  location: "point" | "cell";
}

function isValidThresholdAttribute(
  attribute: Partial<ThresholdAttribute>,
): attribute is ThresholdAttribute {
  return (
    attribute.name !== undefined &&
    attribute.location !== undefined &&
    attribute.item !== undefined &&
    attribute.minimum !== undefined &&
    attribute.maximum !== undefined &&
    attribute.minimum <= attribute.maximum
  );
}

export { isValidThresholdAttribute };
export type { AttributeSource };
