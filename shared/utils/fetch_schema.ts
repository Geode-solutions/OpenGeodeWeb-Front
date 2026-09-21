// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
// Third party imports

// Local imports
import { fetchRaw } from "./fetch_raw.js";
import type { JsonRpcSchema, RequestHandlersWithValidation } from "./types.js";
import { validateSchema } from "./validate_schema.js";

const ERROR_400 = 400;

interface FetchSchemaOptions {
  schema: JsonRpcSchema & { methods: string[] };
  params?: unknown;
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  expectEvent?: boolean;
}

function fetchSchema(
  { schema, params = {}, baseURL, headers, timeout, expectEvent = false }: FetchSchemaOptions,
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
    {
      request_error_function,
      response_function,
      response_error_function,
    },
  );
}

export { fetchSchema };
