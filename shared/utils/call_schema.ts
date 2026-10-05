// Third party imports

// Local imports
import type { JsonRpcSchema, RequestHandlersWithValidation, ResponseOf } from "./types.js";
import { type RpcClient, callRaw } from "./call_raw.js";
import { consola } from "consola";
import { validateSchema } from "./validate_schema.js";

const ERROR_400 = 400;

interface CallSchemaOptions<Schema extends JsonRpcSchema> {
  schema: Schema;
  params?: object;
  client: RpcClient;
  timeout?: number;
}

async function callSchema<Schema extends JsonRpcSchema>(
  { schema, params = {}, client, timeout }: CallSchemaOptions<Schema>,
  {
    request_error_function,
    response_function,
    response_error_function,
    validation_error_function,
  }: RequestHandlersWithValidation = {},
): Promise<ResponseOf<Schema>> {
  const { valid, error: schema_error } = validateSchema(schema, params);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      consola.error("Bad request", schema_error, schema, params);
    }
    if (validation_error_function) {
      validation_error_function({ code: ERROR_400, name: "Bad request", error: schema_error });
    }
    throw new Error(`${schema.$id}: ${schema_error}`);
  }

  const result = await callRaw(
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
  // The microservice validates its responses against the schema `response` it was generated from.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return result as ResponseOf<Schema>;
}

export { callSchema };
