export function api_fetch(
  request_url,
  request_options,
  { request_error_function, response_function, response_error_function } = {},
) {
  const errors_store = use_errors_store()
  const geode_store = use_geode_store()

  geode_store.start_request()
  return useFetch(request_url, {
    baseURL: geode_store.base_url,
    ...request_options,
    onRequestError({ error }) {
      geode_store.stop_request()
      // MUST STAY HERE FOR EASIER DEBUG
      // console.log('onRequestError', error)
      errors_store.add_error({
        code: "",
        route: request_url,
        name: error.message,
        description: error.stack,
      })
      if (request_error_function) {
        request_error_function(error)
      }
    },
    onResponse({ response }) {
      if (response.ok) {
        geode_store.stop_request()
        // MUST STAY HERE FOR EASIER DEBUG
        // console.log('onResponse', response)
        if (response_function) {
          response_function(response)
        }
      }
    },
    onResponseError({ response }) {
      geode_store.stop_request()
      // MUST STAY HERE FOR EASIER DEBUG
      // console.log('onResponseError', response)
      errors_store.add_error({
        code: response.status,
        route: request_url,
        name: response._data.name,
        description: response._data.description,
      })
      if (response_error_function) {
        response_error_function(response)
      }
    },
  })
}

export default api_fetch
