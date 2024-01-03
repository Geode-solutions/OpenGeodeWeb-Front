import Ajv from "ajv"
import _ from "lodash"

export function api_fetch(
  { schema, params },
  { request_error_function, response_function, response_error_function } = {},
) {
  const errors_store = use_errors_store()
  const geode_store = use_geode_store()

  const body = params || {}

  const ajv = new Ajv()

  ajv.addKeyword("method")
  ajv.addKeyword("max_retry")
  const valid = ajv.validate(schema, body)
  if (!valid) {
    errors_store.add_error({
      code: 400,
      route: schema.$id,
      name: "Bad request",
      description: ajv.errorsText(),
    })
    return
  }

  geode_store.start_request()

  const request_options = { method: schema["method"] }
  if (!_.isEmpty(body)) {
    request_options.body = body
  }

  if (schema.max_retry) {
    request_options.max_retry = schema.max_retry
  }

  return useFetch(schema.$id, {
    baseURL: geode_store.base_url,
    ...request_options,
    onRequestError({ error }) {
      geode_store.stop_request()
      errors_store.add_error({
        code: error.code,
        route: schema.$id,
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
        route: schema.$id,
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
