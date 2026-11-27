import type {
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import { useBackStore } from "@ogw_front/stores/back";

interface AttributeRangeInfo {
  min_values: AttributeRangeMinimum[];
  max_values: AttributeRangeMaximum[];
  no_data: boolean;
}

// The *_attribute_names route listing the attributes, and its *_attribute_range route
interface AttributeSchemas {
  names: JsonRpcSchema;
  range: JsonRpcSchema;
}

// The data, and its components for a model, an attribute range is requested for
interface AttributeRangeTarget {
  id: DataId;
  component_ids?: ModelComponentId[];
}

// What identifies a range request: its route and its params, serialized
type RangeRequestKey = string;

// A data never changes once imported: selectors showing the same attribute share one request
const rangeRequests = new Map<RangeRequestKey, Promise<AttributeRangeInfo>>();

async function requestAttributeRange(
  rangeSchema: JsonRpcSchema,
  params: Record<string, unknown>,
): Promise<AttributeRangeInfo> {
  const backStore = useBackStore();
  const range = await backStore.request({ schema: rangeSchema, params });
  // oxlint-disable-next-line no-unsafe-type-assertion -- every *_attribute_range schema shares this response.
  return range as AttributeRangeInfo;
}

async function fetchAttributeRange(
  rangeSchema: JsonRpcSchema,
  target: AttributeRangeTarget,
  attributeName: AttributeName,
): Promise<AttributeRangeInfo> {
  const params = { ...target, attribute_name: attributeName };
  const key: RangeRequestKey = JSON.stringify([rangeSchema.$id, params]);
  let request = rangeRequests.get(key);
  if (request === undefined) {
    request = requestAttributeRange(rangeSchema, params);
    rangeRequests.set(key, request);
  }
  try {
    const range = await request;
    return range;
  } catch (error) {
    // A failed request is not kept: the next call retries it
    rangeRequests.delete(key);
    throw error;
  }
}

export {
  type AttributeRangeInfo,
  type AttributeRangeTarget,
  type AttributeSchemas,
  fetchAttributeRange,
};
