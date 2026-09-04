// Third party imports

// Local imports
import { callRaw } from "./call_raw.js";
import { validateSchema } from "./validate_schema.js";

const ERROR_400 = 400;

function callSchema(
  { schema, params = {}, client, timeout },
  {
    request_error_function,
    response_function,
    response_error_function,
    validation_error_function,
  } = {},
) {
  const { valid, error: schema_error } = validateSchema(schema, params);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", schema_error, schema, params);
    }
    if (validation_error_function) {
      validation_error_function({ code: ERROR_400, name: "Bad request", error: schema_error });
    }
    throw new Error(`${schema.$id}: ${schema_error}`);
  }

  return callRaw(
    {
      rpc: schema.$id,
      params,
      client,
      timeout,
    },
    {
      request_error_function,
      response_function,
      response_error_function,
    },
  );
}

export { callSchema };
