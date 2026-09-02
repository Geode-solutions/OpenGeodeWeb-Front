import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";
import { callSchema } from "@ogw_shared/utils/call_schema";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

export function viewer_call(
  microservice,
  { schema, params = {}, timeout },
  { request_error_function, response_function, response_error_function } = {},
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
      request_error_function(error) {
        microservice.stop_request();
        feedbackStore.add_error(error.code, schema.$id, error.message, error.message);
        if (request_error_function) {
          request_error_function(error);
        }
      },
      response_function(data) {
        endRequestLog(microservice, schema, requestStartingTime);
        microservice.stop_request();
        if (response_function) {
          response_function(data);
        }
      },
      response_error_function(response) {
        microservice.stop_request();
        feedbackStore.add_error(error.code, schema.$id, error.message, error.message);
        if (response_error_function) {
          response_error_function(response);
        }
      },
      validation_error_function({ code, name, error }) {
        microservice.stop_request();
        feedbackStore.add_error(code, schema.$id, name, error);
      },
    },
  );
}
