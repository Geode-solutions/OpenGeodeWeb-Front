// Third party imports

// Local imports
import { fetchRaw } from "./fetch_raw.js";
import { validate_schema } from "./validate_schema.js";

const ERROR_400 = 400;

function fetchSchema(
  { schema, params = {}, baseURL, headers, timeout, expectEvent = false },
  {
    request_error_function,
    response_function,
    response_error_function,
    validation_error_function,
  } = {},
) {
  console.log("fetchSchema", { schema, baseURL, params, headers, timeout });
  const { valid, error: schema_error } = validate_schema(schema, params);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", schema_error, schema, params);
    }
    if (validation_error_function) {
      validation_error_function({ code: ERROR_400, name: "Bad request", error: schema_error });
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
      expectEvent,
    },
    { request_error_function, response_function, response_error_function },
  );
}

export { fetchSchema };
