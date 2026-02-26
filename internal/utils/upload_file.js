import { useFeedbackStore } from "@ogw_front/stores/feedback"

export async function upload_file(
  microservice,
  { route, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedbackStore = useFeedbackStore()
  if (!(file instanceof File)) {
    throw new Error("file must be a instance of File")
  }

  const body = new FormData()
  body.append("file", file)

  const request_options = {
    method: "PUT",
    body: body,
  }
  microservice.start_request()
  return $fetch(route, {
    baseURL: microservice.base_url || "",
    ...request_options,
    onRequestError({ error }) {
      microservice.stop_request()
      feedbackStore.add_error(error.code, route, error.message, error.stack)
      if (request_error_function) {
        request_error_function(error)
      }
    },
    onResponse({ response }) {
      if (response.ok) {
        microservice.stop_request()
        if (response_function) {
          response_function(response)
        }
      }
    },
    onResponseError({ response }) {
      microservice.stop_request()
      feedbackStore.add_error(
        response.status,
        route,
        response.name,
        response.description,
      )
      if (response_error_function) {
        response_error_function(response)
      }
    },
  })
}

export default upload_file
