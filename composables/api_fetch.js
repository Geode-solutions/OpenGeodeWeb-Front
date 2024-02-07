import Ajv from "ajv"
import _ from "lodash"

export function api_fetch(
  { schema, params },
  { request_error_function, response_function, response_error_function } = {},
) {
  // console.log("api_fetch", schema.route, schema.methods)
  const errors_store = use_errors_store()
  const geode_store = use_geode_store()

  const body = params || {}

  const ajv = new Ajv()

  ajv.addKeyword("methods")
  ajv.addKeyword("route")
  ajv.addKeyword("max_retry")
  const valid = ajv.validate(schema, body)
  if (!valid) {
    errors_store.add_error({
      code: 400,
      route: schema.$id,
      name: "Bad request",
      description: ajv.errorsText(),
    })
    throw new Error(schema.$id.concat(": ", ajv.errorsText()))
  }
  geode_store.start_request()
  var methods = []
  for (const method of schema.methods) {
    console.log("method", method)
    methods.push(method)
  }
  console.log("methods", methods)

  const indexOf = methods.indexOf("OPTIONS")
  const splice = methods.splice(indexOf, 1)
  const method = splice[0]

  const request_options = {
    method: method,
  }
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
