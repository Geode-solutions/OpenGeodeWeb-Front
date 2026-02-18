// oxlint-disable-next-line id-length
import _ from "lodash"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import validate_schema from "@ogw_front/utils/validate_schema"

const ERROR_400 = 400

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
    feedbackStore.add_error(ERROR_400, schema.$id, "Bad request", error)
    throw new Error(`${schema.$id}: ${error}`)
  }

  microservice.start_request()

  const method = schema.methods.find((methodItem) => methodItem !== "OPTIONS")
  const request_options = {
    method,
  }
  if (!_.isEmpty(body)) {
    request_options.body = body
  }

  if (schema.max_retry) {
    request_options.max_retry = schema.max_retry
  }
  return $fetch(schema.$id, {
    baseURL: microservice.base_url,
    ...request_options,
    onRequestError({ error }) {
      microservice.stop_request()
      feedbackStore.add_error(
        error.code,
        schema.$id,
        error.message,
        error.stack,
      )
      if (request_error_function) {
        request_error_function(error)
      }
    },
    onResponse({ response }) {
      if (response.ok) {
        microservice.stop_request()
        if (response_function) {
          response_function(response._data)
        }
      }
    },
    onResponseError({ response }) {
      microservice.stop_request()
      feedbackStore.add_error(
        response.status,
        schema.$id,
        response.name,
        response.description,
      )
      if (response_error_function) {
        response_error_function(response)
      }
    },
  })
}

export default api_fetch
