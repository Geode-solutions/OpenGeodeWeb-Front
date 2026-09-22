import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

// The microservice-backed Pinia stores (back/app/...) all expose this shape; only the slice actually used here needs to be declared.
interface Microservice {
  $id?: string;
  base_url: string;
  start_request: () => void;
  stop_request: () => void;
}

interface ApiFetchParams {
  // This function always forwards this schema to fetchSchema, which requires the HTTP-flavored `methods` array (as opposed to the websocket `rpc` field).
  schema: JsonRpcSchema & { methods: string[] };
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Loosely-typed shapes for the dynamic error/response values reported by fetchSchema.
interface FetchErrorLike {
  code?: number;
  message?: string;
  stack?: string;
}

interface FetchErrorResponseLike {
  status?: number;
  name?: string;
  description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFetchErrorLike(error: unknown): FetchErrorLike {
  if (!isRecord(error)) {
    return {};
  }
  return {
    code: typeof error.code === "number" ? error.code : undefined,
    message: typeof error.message === "string" ? error.message : undefined,
    stack: typeof error.stack === "string" ? error.stack : undefined,
  };
}

function toFetchErrorResponseLike(response: unknown): FetchErrorResponseLike {
  if (!isRecord(response)) {
    return {};
  }
  return {
    status: typeof response.status === "number" ? response.status : undefined,
    name: typeof response.name === "string" ? response.name : undefined,
    description: typeof response.description === "string" ? response.description : undefined,
  };
}

// oxlint-disable-next-line max-lines-per-function
async function api_fetch(
  microservice: Microservice,
  { schema, params = {}, headers = {} }: ApiFetchParams,
  {
    request_error_function,
    response_function,
    response_error_function,
    timeout,
    skip_feedback_error,
  }: RequestHandlersWithValidation & { timeout?: number; skip_feedback_error?: boolean } = {},
): Promise<unknown> {
  console.log("[API] Fetching", microservice.base_url);
  const feedbackStore = useFeedbackStore();
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  const result = await fetchSchema(
    {
      schema,
      params,
      baseURL: microservice.base_url,
      headers,
      timeout,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = toFetchErrorLike(error);
        if (!skip_feedback_error) {
          feedbackStore.add_error(
            typedError.code ?? 0,
            schema.$id,
            typedError.message ?? "",
            typedError.stack ?? "",
          );
        }
        if (request_error_function) {
          request_error_function(error);
        }
      },
      response_function(data: unknown) {
        endRequestLog(microservice, schema, requestStartingTime);
        microservice.stop_request();
        if (response_function) {
          response_function(data);
        }
      },
      response_error_function(response: unknown) {
        microservice.stop_request();
        const typedResponse = toFetchErrorResponseLike(response);
        if (!skip_feedback_error) {
          feedbackStore.add_error(
            typedResponse.status ?? 0,
            schema.$id,
            typedResponse.name ?? "",
            typedResponse.description ?? "",
          );
        }
        if (response_error_function) {
          response_error_function(response);
        }
      },
      validation_error_function({ code, name, error }) {
        microservice.stop_request();
        feedbackStore.add_error(code, schema.$id, name, error ?? "");
      },
    },
  );
  return result;
}

export { api_fetch };
export type { Microservice };
