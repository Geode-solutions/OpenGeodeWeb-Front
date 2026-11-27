import type { JsonRpcSchema, RequestHandlersWithValidation } from "@ogw_shared/utils/types.js";
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { reportError, reportTimeout } from "./error_feedback.js";
import type { Milliseconds } from "@ogw_front/types/time";
import type { StoreId } from "@ogw_front/types/identifiers";
import type { Url } from "@ogw_front/types/files";
import { consola } from "consola";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { trackRequest } from "./track_request.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

// The microservice-backed Pinia stores (back/app/...) all expose this shape; only the slice actually used here needs to be declared.
interface Microservice {
  $id: StoreId;
  base_url: Url;
  start_request: () => void;
  stop_request: () => void;
}

// An HTTP method a microservice route accepts, such as "POST"
type HttpMethod = string;

// The schema of an HTTP microservice route, whose methods are always set
type HttpJsonRpcSchema = JsonRpcSchema & { methods: HttpMethod[] };

// How a request reports: its timeout in milliseconds and whether its errors skip the feedback
interface RequestFeedbackOptions {
  timeout?: Milliseconds;
  skip_feedback_error?: boolean;
}

interface ApiFetchParams {
  // This function always forwards this schema to fetchSchema, which requires the HTTP-flavored `methods` array (as opposed to the websocket `rpc` field).
  schema: HttpJsonRpcSchema;
  params?: object;
  headers?: Record<string, string>;
  // False for the requests repeated in the background (pings): the activity panel only shows their failures
  log_success?: boolean;
}

// oxlint-disable-next-line max-lines-per-function
async function api_fetch(
  microservice: Microservice,
  { schema, params = {}, headers = {}, log_success = true }: ApiFetchParams,
  {
    request_error_function,
    response_function,
    response_error_function,
    timeout,
    skip_feedback_error,
  }: RequestHandlersWithValidation & RequestFeedbackOptions = {},
): Promise<unknown> {
  consola.info("[API] Fetching", microservice.base_url);
  const feedbackStore = useFeedbackStore();
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  const followRequest = trackRequest({
    source: microservice.$id,
    kind: "http",
    route: schema.$id,
    params,
    log_success,
  });
  const pending = fetchSchema(
    {
      schema,
      params,
      baseURL: microservice.base_url,
      headers,
      timeout,
    },
    {
      async request_error_function(error: unknown) {
        microservice.stop_request();
        if (skip_feedback_error !== true) {
          reportError(schema.$id, error);
        }
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
        if (skip_feedback_error !== true) {
          reportError(schema.$id, response);
        }
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
  if (skip_feedback_error === true) {
    return request;
  }
  const result = await reportTimeout(schema.$id, request);
  return result;
}

export { api_fetch };
export type { HttpJsonRpcSchema, HttpMethod, Microservice, RequestFeedbackOptions };
