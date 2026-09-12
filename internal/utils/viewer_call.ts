import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { callSchema } from "@ogw_shared/utils/call_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";
import type { Microservice } from "./api_fetch.js";

interface ViewerMicroservice extends Microservice {
  client: RpcClient;
}

interface ViewerCallParams {
  schema: JsonRpcSchema;
  params?: Record<string, unknown>;
  timeout?: number;
}

// Loosely-typed shape for the dynamic error/response values reported by callSchema.
interface RpcErrorLike {
  code?: number;
  message?: string;
}

function viewer_call(
  microservice: ViewerMicroservice,
  { schema, params = {}, timeout }: ViewerCallParams,
  {
    request_error_function,
    response_function,
    response_error_function,
  }: RequestHandlersWithValidation = {},
) {
  const feedbackStore = useFeedbackStore();
  const { client } = microservice;

  const requestStartingTime = startRequestLog(microservice, schema);
  return callSchema(
    {
      schema,
      params,
      client,
      timeout,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = error as RpcErrorLike;
        feedbackStore.add_error(
          typedError.code ?? 0,
          schema.$id,
          typedError.message ?? "",
          typedError.message ?? "",
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
        // Pre-existing bug: this used an undefined `error` identifier (ReferenceError at runtime); fixed to use `response`, mirroring request_error_function above.
        const typedResponse = response as RpcErrorLike;
        feedbackStore.add_error(
          typedResponse.code ?? 0,
          schema.$id,
          typedResponse.message ?? "",
          typedResponse.message ?? "",
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

export { viewer_call };
export type { ViewerMicroservice };
