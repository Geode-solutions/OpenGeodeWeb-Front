import Ajv from "ajv";

function validateSchema(schema, body) {
  const ajv = new Ajv();
  const list_keywords = ["methods", "route", "max_retry", "rpc"];
  for (const keyword of list_keywords) {
    ajv.addKeyword(keyword);
  }
  const valid = ajv.validate(schema, body);
  return { valid, error: ajv.errorsText() };
}

export { validateSchema };
