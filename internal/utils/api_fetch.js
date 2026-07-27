import { fetchRaw } from "@ogw_shared/utils/fetch_raw";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { validate_schema } from "@ogw_front/utils/validate_schema";

const ERROR_400 = 400;

export function api_fetch(
  microservice,
  { schema, params, headers },
  { request_error_function, response_function, response_error_function, timeout } = {},
) {
  const feedbackStore = useFeedbackStore();

  const body = params || {};
  const { valid, error: schema_error } = validate_schema(schema, body);

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", schema_error, schema, params);
    }
    feedbackStore.add_error(ERROR_400, schema.$id, "Bad request", schema_error);
    throw new Error(`${schema.$id}: ${schema_error}`);
  }

  microservice.start_request();

  const method = schema.methods.find((methodItem) => methodItem !== "OPTIONS");

  return fetchRaw(
    {
      route: schema.$id,
      method,
      baseURL: microservice.base_url,
      params: body,
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
    },
  );
}