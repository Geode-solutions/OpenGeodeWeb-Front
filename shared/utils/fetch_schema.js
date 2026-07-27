import { validate_schema } from "@ogw_front/utils/validate_schema";

import { fetchRaw } from "./fetch_raw.js";

const ERROR_400 = 400;

export function fetchSchema(
  { schema, baseURL, params, headers, timeout },
  { onRequestError, onResponse, onResponseError, onValidationError } = {},
) {
  const validationBody = params || {};
  const { valid, error: schema_error } = validate_schema(schema, validationBody);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", schema_error, schema, params);
    }
    if (onValidationError) {
      onValidationError({ status: ERROR_400, error: schema_error });
    }
    throw new Error(`${schema.$id}: ${schema_error}`);
  }

  return fetchRaw(
    {
      schema,
      params,
      baseURL,
      headers,
      max_retry: schema.max_retry,
      timeout,
    },
    { onRequestError, onResponse, onResponseError },
  );
}