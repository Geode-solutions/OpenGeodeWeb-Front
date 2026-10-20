import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { useBackStore } from "@ogw_front/stores/back";

interface AttributeRangeInfo {
  min_values: number[];
  max_values: number[];
  no_data: boolean;
}

// The *_attribute_names route listing the attributes, and its *_attribute_range route
interface AttributeSchemas {
  names: JsonRpcSchema;
  range: JsonRpcSchema;
}

interface AttributeRangeTarget {
  id: string;
  component_ids?: string[];
}

// A data never changes once imported: selectors showing the same attribute share one request
const rangeRequests = new Map<string, Promise<AttributeRangeInfo | undefined>>();

async function requestAttributeRange(
  rangeSchema: JsonRpcSchema,
  params: Record<string, unknown>,
  key: string,
): Promise<AttributeRangeInfo | undefined> {
  const backStore = useBackStore();
  try {
    const range = await backStore.request({ schema: rangeSchema, params });
    // oxlint-disable-next-line no-unsafe-type-assertion -- every *_attribute_range schema shares this response.
    return range as AttributeRangeInfo;
  } catch {
    rangeRequests.delete(key);
    return undefined;
  }
}

async function fetchAttributeRange(
  rangeSchema: JsonRpcSchema,
  target: AttributeRangeTarget,
  attributeName: string,
): Promise<AttributeRangeInfo | undefined> {
  const params = { ...target, attribute_name: attributeName };
  const key = JSON.stringify([rangeSchema.$id, params]);
  let request = rangeRequests.get(key);
  if (request === undefined) {
    request = requestAttributeRange(rangeSchema, params, key);
    rangeRequests.set(key, request);
  }
  const range = await request;
  return range;
}

export { type AttributeRangeInfo, type AttributeSchemas, fetchAttributeRange };
