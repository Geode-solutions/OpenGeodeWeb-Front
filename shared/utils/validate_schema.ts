import Ajv from "ajv";

import type { JsonRpcSchema } from "./types.js";

function validateSchema(schema: JsonRpcSchema, body: unknown): { valid: boolean; error: string } {
  const ajv = new Ajv();
  const list_keywords = ["methods", "route", "max_retry", "rpc"];
  for (const keyword of list_keywords) {
    ajv.addKeyword(keyword);
  }
  const valid = Boolean(ajv.validate(schema, body));
  return { valid, error: ajv.errorsText() };
}

export { validateSchema };
