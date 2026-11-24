import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { reportError, reportTimeout } from "./error_feedback.js";
import type { Microservice } from "./api_fetch.js";
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
  timeout?: number;
}

// oxlint-disable-next-line max-lines-per-function
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
  const followRequest = trackRequest({
    source: microservice.$id,
    kind: "ws",
    route: schema.$id,
    params,
  });
  const pending = callSchema(
    {
      schema,
      params,
      client,
      timeout,
    },
    {
      // CallRaw runs both error handlers on the same rejection: stop the request and report it once, in the response one.
      async request_error_function(error: unknown) {
        if (request_error_function) {
          await request_error_function(error);
        }
      },
      async response_function(data: unknown) {
        endRequestLog(microservice, schema, requestStartingTime);
        microservice.stop_request();
        if (response_function) {
          await response_function(data);
        }
      },
      async response_error_function(response: unknown) {
        microservice.stop_request();
        reportError(schema.$id, response);
        if (response_error_function) {
          await response_error_function(response);
        }
      },
      validation_error_function({ code, name, error }) {
        microservice.stop_request();
        feedbackStore.add_error(code, schema.$id, name, error ?? "");
      },
    },
  );
  const request = followRequest(pending);
  const result = await reportTimeout(schema.$id, request);
  return result;
}

export { viewer_call };
export type { ViewerMicroservice };
