import back_schemas, {
  type AttributeRangeParams,
  type AttributeRangeResponse,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

type AttributeRangeInfo = AttributeRangeResponse;
type AttributeElement = AttributeRangeParams["element"];
type AttributeRangeTarget = Pick<AttributeRangeParams, "id" | "component_ids">;

const ATTRIBUTE_ELEMENTS: readonly string[] =
  back_schemas.opengeodeweb_back.attribute_range.properties.element.enum;

function isAttributeElement(value: unknown): value is AttributeElement {
  return typeof value === "string" && ATTRIBUTE_ELEMENTS.includes(value);
}

// A data never changes once imported: selectors showing the same attribute share one request
const rangeRequests = new Map<string, Promise<AttributeRangeInfo | undefined>>();

async function requestAttributeRange(
  params: AttributeRangeParams,
  key: string,
): Promise<AttributeRangeInfo | undefined> {
  const backStore = useBackStore();
  try {
    return await backStore.request({
      schema: back_schemas.opengeodeweb_back.attribute_range,
      params,
    });
  } catch {
    rangeRequests.delete(key);
    return undefined;
  }
}

async function fetchAttributeRange(
  element: AttributeElement,
  target: AttributeRangeTarget,
  attributeName: string,
): Promise<AttributeRangeInfo | undefined> {
  const params = { ...target, element, attribute_name: attributeName };
  const key = JSON.stringify(params);
  let request = rangeRequests.get(key);
  if (request === undefined) {
    request = requestAttributeRange(params, key);
    rangeRequests.set(key, request);
  }
  const range = await request;
  return range;
}

export { type AttributeElement, type AttributeRangeInfo, fetchAttributeRange, isAttributeElement };
