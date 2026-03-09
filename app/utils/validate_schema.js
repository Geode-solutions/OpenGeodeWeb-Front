import Ajv from "ajv"

function validate_schema(schema, body) {
  const ajv = new Ajv()
  const list_keywords = ["methods", "route", "max_retry", "rpc"]
  for (const keyword of list_keywords) {
    ajv.addKeyword(keyword)
  }
  const valid = ajv.validate(schema, body)
  return { valid, error: ajv.errorsText() }
}

export { validate_schema }
