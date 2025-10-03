export async function upload_file(
  { route, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()
  const geode_store = useGeodeStore()
  if (!(file instanceof File)) {
    throw new Error("file must be a instance of File")
  }

  const body = new FormData()
  body.append("file", file)

  const request_options = {
    method: "PUT",
    body: body,
  }

  geode_store.start_request()
  return $fetch(route, {
    baseURL: geode_store.base_url,
    ...request_options,
    onRequestError({ error }) {
      geode_store.stop_request()
      feedback_store.add_error(error.code, route, error.message, error.stack)
      if (request_error_function) {
        request_error_function(error)
      }
    },
    onResponse({ response }) {
      if (response.ok) {
        geode_store.stop_request()
        if (response_function) {
          response_function(response)
        }
      }
    },
    onResponseError({ response }) {
      geode_store.stop_request()
      feedback_store.add_error(
        response.status,
        route,
        response._data.name,
        response._data.description,
      )
      if (response_error_function) {
        response_error_function(response)
      }
    },
  })
}

export default upload_file
