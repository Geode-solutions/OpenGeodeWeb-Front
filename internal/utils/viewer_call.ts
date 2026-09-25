import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import type { Microservice } from "./api_fetch.js";
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";
import { callSchema } from "@ogw_shared/utils/call_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

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

function toRpcErrorLike(value: unknown): RpcErrorLike {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  return {
    code: "code" in value && typeof value.code === "number" ? value.code : undefined,
    message: "message" in value && typeof value.message === "string" ? value.message : undefined,
  };
}

async function viewer_call(
  microservice: ViewerMicroservice,
  { schema, params = {}, timeout }: ViewerCallParams,
  {
    request_error_function,
    response_function,
    response_error_function,
  }: RequestHandlersWithValidation = {},
): Promise<unknown> {
  const feedbackStore = useFeedbackStore();
  const { client } = microservice;
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  const result = await callSchema(
    {
      schema,
      params,
      client,
      timeout,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = toRpcErrorLike(error);
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
        const typedResponse = toRpcErrorLike(response);
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
  return result;
}

export { viewer_call };
export type { ViewerMicroservice };
