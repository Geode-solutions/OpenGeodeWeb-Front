import _ from "lodash"

export function upload_file(
  { route, params },
  { request_error_function, response_function, response_error_function } = {},
) {
  const errors_store = use_errors_store()
  const geode_store = use_geode_store()

  const body = params || {}
  geode_store.start_request()

  const request_options = { method: "POST" }
  if (!_.isEmpty(body)) {
    request_options.body = body
  }

  return useFetch(route, {
    baseURL: geode_store.base_url,
    ...request_options,
    onRequestError({ error }) {
      geode_store.stop_request()
      errors_store.add_error({
        code: error.code,
        route: route,
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
        if (response_function) {
          response_function(response)
        }
      }
    },
    onResponseError({ response }) {
      geode_store.stop_request()
      errors_store.add_error({
        code: response.status,
        route: route,
        name: response._data.name,
        description: response._data.description,
      })
      if (response_error_function) {
        response_error_function(response)
      }
    },
  })
}

export default upload_file
