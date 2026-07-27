import { performFetch } from "@ogw_shared/utils/perform_fetch";
import { useFeedbackStore } from "@ogw_front/stores/feedback.js";

async function upload_file(
  microservice,
  { schema, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  console.log("[UPLOAD_FILE] Uploading file", { route, file });
  const feedbackStore = useFeedbackStore();

  if (!(file instanceof File)) {
    throw new Error("file must be a instance of File");
  }

  const params = new FormData();
  params.append("file", file);

  microservice.start_request();

  return performFetch(
    { route: schema.$id, method: "PUT", base_url: microservice.base_url, params },
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