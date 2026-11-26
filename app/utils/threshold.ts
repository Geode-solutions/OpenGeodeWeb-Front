import type { AttributeSchemas } from "@ogw_front/utils/attribute_range";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";

interface AttributeSource {
  title: string;
  schemas: AttributeSchemas;
  timeStepKey: string;
  params: { id: DataId; component_ids?: ModelComponentId[] };
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
