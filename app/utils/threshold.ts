import type { AttributeRangeTarget, AttributeSchemas } from "@ogw_front/utils/attribute_range";
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";
import type { TimeStepKey } from "@ogw_front/types/attribute";
import type { Title } from "@ogw_front/types/ui";

// The data and components of an attribute source, sent as the params of its requests
type AttributeSourceParams = AttributeRangeTarget & Record<string, unknown>;

interface AttributeSource {
  title: Title;
  schemas: AttributeSchemas;
  timeStepKey: TimeStepKey;
  params: AttributeSourceParams;
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
export type { AttributeSource, AttributeSourceParams };
