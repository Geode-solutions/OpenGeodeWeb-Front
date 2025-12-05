export async function upload_file(
  { route, file },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()
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
      feedback_store.add_error(error.code, route, error.message, error.stack)
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
