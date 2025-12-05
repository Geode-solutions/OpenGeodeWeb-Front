import _ from "lodash"
import validate_schema from "@ogw_front/utils/validate_schema"

export function api_fetch(
  microservice,
  { schema, params },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedbackStore = useFeedbackStore()

  const body = params || {}

  const { valid, error } = validate_schema(schema, body)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedbackStore.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": ", error))
  }

  microservice.start_request()

  const method = schema.methods.filter((method) => method !== "OPTIONS")[0]
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
    baseURL: microservice.base_url,
    ...request_options,
    async onRequestError({ error }) {
      await microservice.stop_request()
      await feedbackStore.add_error(
        error.code,
        schema.$id,
        error.message,
        error.stack,
      )
      if (request_error_function) {
        await request_error_function(error)
      }
    },
    async onResponse({ response }) {
      if (response.ok) {
        await microservice.stop_request()
        if (response_function) {
          await response_function(response)
        }
      }
    },
    async onResponseError({ response }) {
      await microservice.stop_request()
      await feedbackStore.add_error(
        response.status,
        schema.$id,
        response._data.name,
        response._data.description,
      )
      if (response_error_function) {
        await response_error_function(response)
      }
    },
  })
}

export default api_fetch
