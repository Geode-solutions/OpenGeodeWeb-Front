import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";

// The microservice-backed Pinia stores (back/app/...) all expose this shape;
// only the slice actually used here needs to be declared.
export interface Microservice {
  $id: string;
  base_url: string;
  start_request: () => void;
  stop_request: () => void;
}

interface ApiFetchParams {
  // api_fetch always forwards this schema to fetchSchema, which requires the
  // HTTP-flavored `methods` array (as opposed to the websocket `rpc` field).
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

export function api_fetch(
  microservice: Microservice,
  { schema, params = {}, headers = {} }: ApiFetchParams,
  {
    request_error_function,
    response_function,
    response_error_function,
    timeout,
  }: RequestHandlersWithValidation & { timeout?: number } = {},
) {
  console.log("[API] Fetching", microservice.base_url);
  const feedbackStore = useFeedbackStore();
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  return fetchSchema(
    {
      schema,
      params,
      baseURL: microservice.base_url,
      headers,
      max_retry: schema.max_retry,
      timeout,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = error as FetchErrorLike;
        feedbackStore.add_error(
          typedError.code ?? 0,
          schema.$id,
          typedError.message ?? "",
          typedError.stack ?? "",
        );
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
        const typedResponse = response as FetchErrorResponseLike;
        feedbackStore.add_error(
          typedResponse.status ?? 0,
          schema.$id,
          typedResponse.name ?? "",
          typedResponse.description ?? "",
        );
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
}
