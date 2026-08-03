import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

export function api_fetch(
  microservice,
  { schema, params = {}, headers = {} },
  { request_error_function, response_function, response_error_function, timeout } = {},
) {
  console.log("[API] Fetching", microservice.base_url);
  const feedbackStore = useFeedbackStore();
  microservice.start_request();

  const requestStartingTime = startRequestLog(microservice, schema);
  return fetchSchema(
    {
      schema,
      baseURL: microservice.base_url,
      params,
      headers,
      max_retry: schema.max_retry,
      timeout,
    },
    {
      onRequestError(error) {
        microservice.stop_request();
        feedbackStore.add_error(error.code, schema.$id, error.message, error.stack);
        if (request_error_function) {
          request_error_function(error);
        }
      },
      onResponse(data) {
        endRequestLog(microservice, schema, requestStartingTime);
        microservice.stop_request();
        if (response_function) {
          response_function(data);
        }
      },
      onResponseError(response) {
        microservice.stop_request();
        feedbackStore.add_error(response.status, schema.$id, response.name, response.description);
        if (response_error_function) {
          response_error_function(response);
        }
      },
      onValidationError(code, route, name, error) {
        microservice.stop_request();
        feedbackStore.add_error(code, route, name, error);
      },
    },
  );
}
