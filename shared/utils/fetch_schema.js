// Third party imports
import { validate_schema } from "@geode/opengeodeweb-front/app/utils/validate_schema.js";

// Local imports
import { fetchRaw } from "./fetch_raw.js";

const ERROR_400 = 400;

function fetchSchema(
  { schema, params = {}, baseURL, headers, timeout },
  { onRequestError, onResponse, onResponseError, onValidationError } = {},
) {
  console.log("fetchSchema", { schema, baseURL, params, headers, timeout });
  const { valid, error: schema_error } = validate_schema(schema, params);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", schema_error, schema, params);
    }
    if (onValidationError) {
      onValidationError({ code: ERROR_400, name: "Bad request", error: schema_error });
    }
    throw new Error(`${schema.$id}: ${schema_error}`);
  }

  return fetchRaw(
    {
      route: schema.$id,
      method: schema.methods.find((method) => method !== "OPTIONS"),
      params,
      baseURL,
      headers,
      max_retry: schema.max_retry,
      timeout,
    },
    { onRequestError, onResponse, onResponseError },
  );
}

export { fetchSchema };