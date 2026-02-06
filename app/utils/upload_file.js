import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useGeodeStore } from "@ogw_front/stores/geode"

export async function upload_file(
  { route, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedbackStore = useFeedbackStore()
  const geodeStore = useGeodeStore()
  if (!(file instanceof File)) {
    throw new Error("file must be a instance of File")
  }

  const body = new FormData()
  body.append("file", file)

  const request_options = {
    method: "PUT",
    body: body,
  }
  geodeStore.start_request()
  return $fetch(route, {
    baseURL: geodeStore.base_url,
    ...request_options,
    onRequestError({ error }) {
      geodeStore.stop_request()
      feedbackStore.add_error(error.code, route, error.message, error.stack)
      if (request_error_function) {
        request_error_function(error)
      }
    },
    onResponse({ response }) {
      if (response.ok) {
        geodeStore.stop_request()
        if (response_function) {
          response_function(response)
        }
      }
    },
    onResponseError({ response }) {
      geodeStore.stop_request()
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
