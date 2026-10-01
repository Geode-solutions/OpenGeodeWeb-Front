// Third party imports
import {
  type EventHandler,
  type H3Event,
  createError,
  defineEventHandler,
  getQuery,
  isError,
  readBody,
  setResponseStatus,
} from "h3";
import Ajv from "ajv";
import { consola } from "consola";

// Local imports
import type {
  JsonRpcSchema,
  ParamsOf,
  ResponseOf,
} from "@geode/opengeodeweb-front/shared/utils/types.ts";
import type { ErrorResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { validateSchema } from "@geode/opengeodeweb-front/shared/utils/validate_schema.ts";

const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

type RouteSchema = JsonRpcSchema & { readonly response?: object };

// Same body as the Flask microservices' errors, so the client reads every error the same way
function toErrorResponse(error: unknown): ErrorResponse {
  if (isError(error)) {
    return {
      code: error.statusCode,
      name: error.statusMessage ?? "Error",
      description: error.message,
    };
  }
  return {
    code: INTERNAL_SERVER_ERROR,
    name: "Internal Server Error",
    description: error instanceof Error ? error.message : String(error),
  };
}

function sendError(event: H3Event, schema: RouteSchema, error: unknown): ErrorResponse {
  consola.error(`[${schema.$id}]`, error);
  const errorResponse = toErrorResponse(error);
  setResponseStatus(event, errorResponse.code, errorResponse.name);
  return errorResponse;
}

async function readParams(event: H3Event): Promise<unknown> {
  if (event.method === "GET" || event.method === "HEAD") {
    return getQuery(event);
  }
  const body: unknown = await readBody(event);
  return body ?? {};
}

function checkResponse(schema: RouteSchema, payload: unknown): void {
  if (process.env.NODE_ENV === "production" || schema.response === undefined) {
    return;
  }
  const ajv = new Ajv();
  if (!ajv.validate(schema.response, payload)) {
    throw new Error(`${schema.$id} response does not match its schema: ${ajv.errorsText()}`);
  }
}

// Register a JSON route whose handler takes its typed params and returns its typed success response. Errors must be thrown (createError or any exception), they are sent as an ErrorResponse.
function defineTypedEventHandler<Schema extends RouteSchema>(
  schema: Schema,
  handler: (
    params: ParamsOf<Schema>,
    event: H3Event,
  ) => ResponseOf<Schema> | Promise<ResponseOf<Schema>>,
): EventHandler<Record<string, never>, Promise<ResponseOf<Schema> | ErrorResponse>> {
  return defineEventHandler(async (event) => {
    try {
      const params = await readParams(event);
      const { valid, error } = validateSchema(schema, params);
      if (!valid) {
        throw createError({
          statusCode: BAD_REQUEST,
          statusMessage: "Bad Request",
          message: error,
        });
      }
      // Validated against the schema the params type was generated from
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const response = await handler(params as ParamsOf<Schema>, event);
      checkResponse(schema, response);
      return response;
    } catch (error) {
      return sendError(event, schema, error);
    }
  });
}

// Register a route that cannot go through defineTypedEventHandler: non JSON request body (file upload) or non JSON response (stream). Errors are still sent as an ErrorResponse.
function defineRawEventHandler<Response>(
  schema: RouteSchema,
  handler: (event: H3Event) => Response | Promise<Response>,
): EventHandler<Record<string, never>, Promise<Response | ErrorResponse>> {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      return sendError(event, schema, error);
    }
  });
}

export { defineRawEventHandler, defineTypedEventHandler };
