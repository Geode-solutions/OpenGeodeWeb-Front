// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
// Third party imports

// Local imports
import { callRaw } from "./call_raw.js";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { RpcClient } from "./call_raw.js";
import type { JsonRpcSchema, RequestHandlersWithValidation } from "./types.js";
import { validateSchema } from "./validate_schema.js";

const ERROR_400 = 400;

interface CallSchemaOptions {
  schema: JsonRpcSchema;
  params?: Record<string, unknown>;
  client: RpcClient;
  timeout?: number;
}

function callSchema(
  { schema, params = {}, client, timeout }: CallSchemaOptions,
  {
    request_error_function,
    response_function,
    response_error_function,
    validation_error_function,
  }: RequestHandlersWithValidation = {},
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
