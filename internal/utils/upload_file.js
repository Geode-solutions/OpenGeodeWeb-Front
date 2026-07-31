import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback.js";

function upload_file(
  microservice,
  { schema, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  console.log("[UPLOAD_FILE] Uploading file", { schema, file });
  const feedbackStore = useFeedbackStore();

  if (!(file instanceof File)) {
    throw new Error("file must be a instance of File");
  }

  const params = new FormData();
  params.append("file", file);

  microservice.start_request();
  const route = schema.$id;

  return fetchRaw(
    {
      route,
      method: schema.methods.find((method) => method !== "OPTIONS"),
      params,
      baseURL: microservice.base_url,
    },
    {
      onRequestError(error) {
        microservice.stop_request();
        feedbackStore.add_error(error.code, route, error.message, error.stack);
        if (request_error_function) {
          request_error_function(error);
        }
      },
      onResponse(response) {
        microservice.stop_request();
        if (response_function) {
          response_function(response);
        }
      },
      onResponseError(response) {
        microservice.stop_request();
        feedbackStore.add_error(response.status, route, response.name, response.description);
        if (response_error_function) {
          response_error_function(response);
        }
      },
    },
  );
}

export { upload_file };
