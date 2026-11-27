import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { reportError, reportTimeout } from "./error_feedback.js";
import type { Microservice } from "./api_fetch.js";
import type { Milliseconds } from "@ogw_front/types/time";
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";
import { callSchema } from "@ogw_shared/utils/call_schema";
import { trackRequest } from "./track_request.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

interface ViewerMicroservice extends Microservice {
  client: RpcClient;
}

interface ViewerCallParams {
  schema: JsonRpcSchema;
  params?: object;
  timeout?: Milliseconds;
}

// Stops the request and reports its errors once, around the caller's own handlers
function viewerCallHandlers(
  microservice: ViewerMicroservice,
  schema: JsonRpcSchema,
  requestStartingTime: Date,
  {
    request_error_function,
    response_function,
    response_error_function,
  }: RequestHandlersWithValidation,
): RequestHandlersWithValidation {
  return {
    // CallRaw runs both error handlers on the same rejection: stop the request and report it once, in the response one.
    async request_error_function(error: unknown): Promise<void> {
      if (request_error_function) {
        await request_error_function(error);
      }
    },
    async response_function(data: unknown): Promise<void> {
      endRequestLog(microservice, schema, requestStartingTime);
      microservice.stop_request();
      if (response_function) {
        await response_function(data);
      }
    },
    async response_error_function(response: unknown): Promise<void> {
      microservice.stop_request();
      reportError(schema.$id, response);
      if (response_error_function) {
        await response_error_function(response);
      }
    },
    validation_error_function({ code, name, error }): void {
      microservice.stop_request();
      useFeedbackStore().add_error(code, schema.$id, name, error ?? "");
    },
  };
}

async function viewer_call(
  microservice: ViewerMicroservice,
  { schema, params = {}, timeout }: ViewerCallParams,
  handlers: RequestHandlersWithValidation = {},
): Promise<unknown> {
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  const followRequest = trackRequest({
    source: microservice.$id,
    kind: "ws",
    route: schema.$id,
    params,
  });
  const pending = callSchema(
    { schema, params, client: microservice.client, timeout },
    viewerCallHandlers(microservice, schema, requestStartingTime, handlers),
  );
  const result = await reportTimeout(schema.$id, followRequest(pending));
  return result;
}

export { viewer_call };
export type { ViewerMicroservice };
