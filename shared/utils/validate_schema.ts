import Ajv from "ajv";

import type { JsonRpcSchema } from "./types.js";

function validateSchema(schema: JsonRpcSchema, body: unknown): { valid: boolean; error: string } {
  // A multipart body carries files, not the JSON params the schema describes; the route validates it itself.
  if (body instanceof FormData) {
    return { valid: true, error: "No errors" };
  }
  const ajv = new Ajv();
  const list_keywords = ["methods", "route", "max_retry", "rpc", "response"];
  for (const keyword of list_keywords) {
    ajv.addKeyword(keyword);
  }
  const valid = ajv.validate(schema, body);
  return { valid, error: ajv.errorsText() };
}

export { validateSchema };
